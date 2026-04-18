"use server";

import { db } from "@/lib/prisma";

export const getOrdersByPhone = async (phone: string, slug: string) => {
  return db.order.findMany({
    where: {
      customerPhone: phone,
      restaurant: { slug },
    },
    include: {
      orderProducts: {
        include: { product: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
};
