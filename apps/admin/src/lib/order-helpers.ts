import { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: "Aguardando", color: "text-yellow-600" },
  IN_PREPARATION: { label: "Em preparo", color: "text-blue-600" },
  FINISHED: { label: "Pronto", color: "text-green-600" },
  CANCELLED: { label: "Cancelado", color: "text-red-500" },
};

export function getDateRange(days: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

export function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
