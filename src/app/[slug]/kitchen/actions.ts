"use server";

import { OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { adminMessaging } from "@/lib/firebase-admin";
import { db } from "@/lib/prisma";
import { signKitchenSession } from "@/lib/session";

const STATUS_NOTIFICATION: Partial<
  Record<OrderStatus, { title: string; body: string }>
> = {
  IN_PREPARATION: {
    title: "Pedido em preparo! 👨‍🍳",
    body: "A cozinha já está preparando o seu pedido.",
  },
  FINISHED: {
    title: "Pedido pronto! ✅",
    body: "Seu pedido está pronto. Pode retirar!",
  },
  CANCELLED: {
    title: "Pedido cancelado ❌",
    body: "Seu pedido foi cancelado. Entre em contato com o estabelecimento.",
  },
};

async function sendPushIfAvailable(orderId: number, status: OrderStatus) {
  const notification = STATUS_NOTIFICATION[status];
  if (!notification) return;

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { fcmToken: true, id: true },
    });

    if (!order?.fcmToken) return;

    await adminMessaging().send({
      token: order.fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        url: `/orders/${orderId}`,
        orderId: String(orderId),
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          requireInteraction: true,
        },
        fcmOptions: { link: `/orders/${orderId}` },
      },
    });
  } catch {
    // push falhou silenciosamente (token expirado, sem permissão, etc.)
  }
}

export const kitchenLogin = async (slug: string, password: string) => {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { kitchenPassword: true },
  });

  if (!restaurant)
    return { success: false, error: "Restaurante não encontrado" };

  const isHash = restaurant.kitchenPassword.startsWith("$2");
  const valid = isHash
    ? await bcrypt.compare(password, restaurant.kitchenPassword)
    : restaurant.kitchenPassword === password;

  if (!valid) return { success: false, error: "Senha incorreta" };

  const token = signKitchenSession(slug);
  const cookieStore = await cookies();
  cookieStore.set(`kitchen_${slug}`, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return { success: true };
};

export const kitchenLogout = async (slug: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(`kitchen_${slug}`);
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus,
) => {
  await db.order.update({ where: { id: orderId }, data: { status } });
  await sendPushIfAvailable(orderId, status);
};

export const cancelOrder = async (orderId: number) => {
  await db.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
  await sendPushIfAvailable(orderId, "CANCELLED");
};

export const getKitchenOrders = async (slug: string) => {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!restaurant) return [];

  return db.order.findMany({
    where: {
      restaurantId: restaurant.id,
      status: { notIn: ["FINISHED", "CANCELLED"] },
    },
    include: {
      orderProducts: {
        include: { product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};

export const getKitchenProducts = async (slug: string) => {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!restaurant) return [];

  return db.product.findMany({
    where: { restaurantId: restaurant.id },
    select: { id: true, name: true, isAvailable: true, menuCategory: { select: { name: true } } },
    orderBy: [{ menuCategory: { name: "asc" } }, { name: "asc" }],
  });
};

export const kitchenToggleProduct = async (productId: string, isAvailable: boolean) => {
  await db.product.update({ where: { id: productId }, data: { isAvailable } });
};

export const toggleRestaurantPause = async (slug: string) => {
  const restaurant = await db.restaurant.findUnique({ where: { slug }, select: { id: true, isPaused: true } });
  if (!restaurant) return;
  await db.restaurant.update({ where: { id: restaurant.id }, data: { isPaused: !restaurant.isPaused } });
};

export const getRestaurantPauseStatus = async (slug: string): Promise<boolean> => {
  const r = await db.restaurant.findUnique({ where: { slug }, select: { isPaused: true } });
  return r?.isPaused ?? false;
};
