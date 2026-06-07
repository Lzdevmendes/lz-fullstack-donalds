"use server";

import { ConsumptionMethod } from "@prisma/client";

import { CartItem } from "@/contexts/cart";
import { db } from "@/lib/prisma";

interface CreateOrderInput {
  restaurantId: string;
  consumptionMethod: ConsumptionMethod;
  items: CartItem[];
  customerName: string;
  customerPhone?: string;
  tableNumber?: number;
  couponCode?: string;
  fcmToken?: string;
}

export const createOrder = async ({
  restaurantId, consumptionMethod, items, customerName, customerPhone, tableNumber, couponCode, fcmToken,
}: CreateOrderInput): Promise<{ orderId: number; slug: string }> => {
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    select: { isPaused: true, slug: true },
  });

  if (!restaurant) throw new Error("Restaurante não encontrado");
  if (restaurant.isPaused) throw new Error("Restaurante pausado — não aceitando pedidos no momento");

  // Re-busca preços do banco para prevenir manipulação pelo cliente
  const productIds = items.map((i) => i.product.id);
  const dbProducts = await db.product.findMany({
    where: { id: { in: productIds }, restaurantId, isAvailable: true },
    select: { id: true, price: true },
  });

  if (dbProducts.length !== productIds.length) {
    throw new Error("Um ou mais produtos não estão disponíveis");
  }

  const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

  const subtotal = items.reduce(
    (acc, item) => acc + (priceMap.get(item.product.id) ?? 0) * item.quantity,
    0,
  );

  let total = subtotal;
  let appliedCouponId: string | undefined;
  let couponMaxUses: number | undefined;

  if (couponCode) {
    const coupon = await db.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });
    if (
      coupon &&
      coupon.restaurantId === restaurantId &&
      coupon.isActive &&
      coupon.usedCount < coupon.maxUses &&
      (!coupon.expiresAt || coupon.expiresAt > new Date())
    ) {
      total = subtotal * (1 - coupon.discountPercent / 100);
      appliedCouponId = coupon.id;
      couponMaxUses = coupon.maxUses;
    }
  }

  const { order } = await db.$transaction(async (tx) => {
    if (appliedCouponId && couponMaxUses !== undefined) {
      const updated = await tx.coupon.updateMany({
        where: {
          id: appliedCouponId,
          isActive: true,
          usedCount: { lt: couponMaxUses },
        },
        data: { usedCount: { increment: 1 } },
      });
      if (updated.count === 0) {
        throw new Error("Cupom não disponível");
      }
    }

    const createdOrder = await tx.order.create({
      data: {
        total,
        status: "PENDING",
        consumptionMethod,
        restaurantId,
        customerName,
        customerPhone,
        tableNumber,
        fcmToken: fcmToken ?? null,
        orderProducts: {
          createMany: {
            data: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: priceMap.get(item.product.id) ?? 0,
              notes: item.notes,
            })),
          },
        },
      },
      include: { restaurant: { select: { slug: true } } },
    });

    return { order: createdOrder };
  });

  return { orderId: order.id, slug: order.restaurant.slug };
};
