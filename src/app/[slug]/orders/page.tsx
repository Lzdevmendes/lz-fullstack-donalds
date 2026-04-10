"use client";

import { ClockIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getOrdersByPhone } from "./actions";

interface OrderItem {
  id: number;
  total: number;
  status: string;
  createdAt: Date;
  consumptionMethod: string;
  orderProducts: {
    quantity: number;
    product: { name: string };
  }[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando",
  IN_PREPARATION: "Em preparo",
  FINISHED: "Pronto",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-600",
  IN_PREPARATION: "text-blue-600",
  FINISHED: "text-green-600",
};

const METHOD_LABEL: Record<string, string> = {
  DINE_IN: "Comer aqui",
  TAKEAWAY: "Para levar",
};

export default function OrderHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<OrderItem[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!phone.trim()) return;
    startTransition(async () => {
      const result = await getOrdersByPhone(phone.trim(), slug);
      setOrders(result);
      setSearched(true);
    });
  };

  return (
    <div className="min-h-screen px-5 py-8">
      <h1 className="mb-1 text-xl font-semibold">Meus pedidos</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Digite seu telefone para ver seus pedidos anteriores.
      </p>

      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="Ex: (11) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={isPending || !phone.trim()}
          className="shrink-0"
        >
          <SearchIcon size={16} />
        </Button>
      </div>

      {searched && orders !== null && (
        <div className="mt-6">
          {orders.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhum pedido encontrado para este telefone.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/${slug}/orders/${order.id}`}
                  className="block rounded-2xl border p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Pedido #{order.id}</span>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${STATUS_COLOR[order.status] ?? "text-muted-foreground"}`}
                    >
                      <ClockIcon size={11} />
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {METHOD_LABEL[order.consumptionMethod]} •{" "}
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                    {order.orderProducts
                      .map((op) => `${op.quantity}x ${op.product.name}`)
                      .join(", ")}
                  </p>
                  <p className="mt-2 font-semibold">
                    {formatCurrency(order.total)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
