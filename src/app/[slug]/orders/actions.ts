"use server";

import { db } from "@/lib/prisma";

export const getOrdersByPhone = async (phone: string, slug: string) => {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!restaurant) return [];

  const orders = await db.order.findMany({
    where: {
      restaurantId: restaurant.id,
      customerPhone: phone,
    },
    include: {
      orderProducts: {
        include: { product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return orders;
};
