"use server";

import { OrderStatus } from "@prisma/client";
import { cookies } from "next/headers";

import { db } from "@/lib/prisma";

export const kitchenLogin = async (slug: string, password: string) => {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { kitchenPassword: true },
  });

  if (!restaurant || restaurant.kitchenPassword !== password) {
    return { success: false, error: "Senha incorreta" };
  }

  const cookieStore = await cookies();
  cookieStore.set(`kitchen_${slug}`, password, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
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
  await db.order.update({
    where: { id: orderId },
    data: { status },
  });
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
      status: { not: "FINISHED" },
    },
    include: {
      orderProducts: {
        include: { product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
};
