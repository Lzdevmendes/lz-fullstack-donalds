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
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
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
              price: item.product.price,
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
