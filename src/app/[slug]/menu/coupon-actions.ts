"use server";

import { db } from "@/lib/prisma";

export const validateCoupon = async (
  code: string,
  restaurantId: string,
): Promise<{ valid: true; discountPercent: number } | { valid: false; error: string }> => {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon) return { valid: false, error: "Cupom não encontrado" };
  if (coupon.restaurantId !== restaurantId)
    return { valid: false, error: "Cupom inválido para este restaurante" };
  if (coupon.usedCount >= coupon.maxUses)
    return { valid: false, error: "Cupom esgotado" };
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return { valid: false, error: "Cupom expirado" };

  return { valid: true, discountPercent: coupon.discountPercent };
};
