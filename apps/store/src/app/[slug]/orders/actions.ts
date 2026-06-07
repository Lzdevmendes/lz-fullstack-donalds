"use server";

import { db } from "@/lib/prisma";
import { normalizePhone } from "@/lib/utils";

export const getOrdersByPhone = async (phone: string, slug: string) => {
  const digits = normalizePhone(phone);
  if (!digits) return [];

  return db.order.findMany({
    where: {
      customerPhone: { contains: digits },
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
