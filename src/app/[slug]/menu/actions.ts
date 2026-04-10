"use server";

import { ConsumptionMethod } from "@prisma/client";

import { CartItem } from "@/contexts/cart";
import { db } from "@/lib/prisma";

interface CreateOrderInput {
  slug: string;
  restaurantId: string;
  consumptionMethod: ConsumptionMethod;
  items: CartItem[];
  couponCode?: string;
}

export const createOrder = async ({
  restaurantId,
  consumptionMethod,
  items,
  couponCode,
}: CreateOrderInput): Promise<{ orderId: number; slug: string }> => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  let total = subtotal;
  let appliedCouponId: string | undefined;

  if (couponCode) {
    const coupon = await db.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });
    if (
      coupon &&
      coupon.restaurantId === restaurantId &&
      coupon.usedCount < coupon.maxUses &&
      (!coupon.expiresAt || coupon.expiresAt > new Date())
    ) {
      total = subtotal * (1 - coupon.discountPercent / 100);
      appliedCouponId = coupon.id;
    }
  }

  const order = await db.order.create({
    data: {
      total,
      status: "PENDING",
      consumptionMethod,
      restaurantId,
      orderProducts: {
        createMany: {
          data: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    },
    include: { restaurant: true },
  });

  if (appliedCouponId) {
    await db.coupon.update({
      where: { id: appliedCouponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  return { orderId: order.id, slug: order.restaurant.slug };
};
