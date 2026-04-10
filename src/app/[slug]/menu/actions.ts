"use server";

import { ConsumptionMethod } from "@prisma/client";

import { CartItem } from "@/contexts/cart";
import { db } from "@/lib/prisma";

interface CreateOrderInput {
  slug: string;
  restaurantId: string;
  consumptionMethod: ConsumptionMethod;
  items: CartItem[];
  customerName: string;
  customerPhone?: string;
  tableNumber?: number;
}

export const createOrder = async ({
  restaurantId,
  consumptionMethod,
  items,
  customerName,
  customerPhone,
  tableNumber,
}: CreateOrderInput): Promise<{ orderId: number; slug: string }> => {
  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  const order = await db.order.create({
    data: {
      total,
      status: "PENDING",
      consumptionMethod,
      restaurantId,
      customerName,
      customerPhone,
      tableNumber,
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
    include: { restaurant: true },
  });

  return { orderId: order.id, slug: order.restaurant.slug };
};
