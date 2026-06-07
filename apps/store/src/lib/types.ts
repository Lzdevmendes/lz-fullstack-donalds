import { OrderStatus } from "@prisma/client";

export type OrderStatusType = OrderStatus;

export interface OrderStats {
  total: number | null;
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
}

export interface OrderSummary {
  id: number;
  status: OrderStatusType;
  total: number;
  consumptionMethod: "DINE_IN" | "TAKEAWAY";
  customerName: string | null;
  tableNumber: number | null;
  createdAt: Date;
}
