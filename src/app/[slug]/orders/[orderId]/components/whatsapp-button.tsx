"use client";

import { MessageCircleIcon } from "lucide-react";

const METHOD_LABEL: Record<string, string> = {
  DINE_IN: "Comer aqui",
  TAKEAWAY: "Para levar",
};

interface OrderItem {
  quantity: number;
  price: number;
  product: { name: string };
}

interface WhatsAppButtonProps {
  order: {
    id: number;
    total: number;
    consumptionMethod: string;
    customerName?: string | null;
    tableNumber?: number | null;
    orderProducts: OrderItem[];
    restaurant: { name: string };
  };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function WhatsAppButton({ order }: WhatsAppButtonProps) {
  const lines: string[] = [];
  lines.push(`*Pedido #${order.id} — ${order.restaurant.name}*`);
  lines.push(`📋 ${METHOD_LABEL[order.consumptionMethod] ?? order.consumptionMethod}`);
  if (order.customerName) lines.push(`👤 ${order.customerName}`);
  if (order.tableNumber) lines.push(`🪑 Mesa ${order.tableNumber}`);
  lines.push("");
  for (const op of order.orderProducts) {
    lines.push(`• ${op.quantity}x ${op.product.name} — ${formatCurrency(op.price * op.quantity)}`);
  }
  lines.push("");
  lines.push(`*Total: ${formatCurrency(order.total)}*`);

  const url = `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-green-500 bg-green-50 text-sm font-semibold text-green-700 transition hover:bg-green-100 active:opacity-80"
    >
      <MessageCircleIcon size={18} />
      Compartilhar via WhatsApp
    </a>
  );
}
