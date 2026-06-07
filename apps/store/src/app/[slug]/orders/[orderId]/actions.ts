"use server";

import { db } from "@/lib/prisma";

export const submitRating = async (
  orderId: number,
  stars: number,
  comment: string,
): Promise<{ success: boolean; error?: string }> => {
  if (stars < 1 || stars > 5) return { success: false, error: "Nota inválida" };

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { status: true, rating: true },
  });

  if (!order) return { success: false, error: "Pedido não encontrado" };
  if (order.status !== "FINISHED") return { success: false, error: "Só é possível avaliar pedidos concluídos" };
  if (order.rating) return { success: false, error: "Pedido já avaliado" };

  await db.rating.create({
    data: { orderId, stars, comment: comment.trim() || undefined },
  });

  return { success: true };
};
