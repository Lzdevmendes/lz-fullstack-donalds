"use client";

import { OrderStatus } from "@prisma/client";
import { ClockIcon, LogOutIcon, RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import {
  getKitchenOrders,
  kitchenLogout,
  updateOrderStatus,
} from "./actions";

interface OrderProduct {
  quantity: number;
  product: { name: string };
}

interface Order {
  id: number;
  status: OrderStatus;
  consumptionMethod: string;
  createdAt: Date;
  orderProducts: OrderProduct[];
}

const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "IN_PREPARATION",
  IN_PREPARATION: "FINISHED",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Aguardando",
  IN_PREPARATION: "Em preparo",
  FINISHED: "Pronto",
};

const STATUS_BTN: Partial<Record<OrderStatus, string>> = {
  PENDING: "Iniciar preparo",
  IN_PREPARATION: "Marcar como pronto",
};

const METHOD_LABEL: Record<string, string> = {
  DINE_IN: "Mesa",
  TAKEAWAY: "Retirada",
};

interface KitchenBoardProps {
  slug: string;
}

const KitchenBoard = ({ slug }: KitchenBoardProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    startTransition(async () => {
      const data = await getKitchenOrders(slug);
      setOrders(data as Order[]);
    });
  }, [slug]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleAdvanceStatus = async (order: Order) => {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    setUpdatingId(order.id);
    await updateOrderStatus(order.id, next);
    await fetchOrders();
    setUpdatingId(null);
  };

  const handleLogout = async () => {
    await kitchenLogout(slug);
    window.location.reload();
  };

  const pending = orders.filter((o) => o.status === "PENDING");
  const inPrep = orders.filter((o) => o.status === "IN_PREPARATION");

  const elapsed = (date: Date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    return mins < 1 ? "agora" : `${mins}min`;
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        order.status === "PENDING" ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">#{order.id}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon size={11} />
          {elapsed(order.createdAt)}
        </div>
      </div>

      <p className="mb-3 text-xs font-medium text-muted-foreground">
        {METHOD_LABEL[order.consumptionMethod] ?? order.consumptionMethod}
      </p>

      <ul className="mb-4 space-y-1">
        {order.orderProducts.map((op, i) => (
          <li key={i} className="text-sm">
            {op.quantity}x {op.product.name}
          </li>
        ))}
      </ul>

      {STATUS_NEXT[order.status] && (
        <Button
          size="sm"
          className="w-full rounded-full"
          disabled={updatingId === order.id}
          onClick={() => handleAdvanceStatus(order)}
        >
          {updatingId === order.id
            ? "Atualizando..."
            : STATUS_BTN[order.status]}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Painel da Cozinha</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchOrders}
            disabled={isPending}
          >
            <RefreshCwIcon size={16} className={isPending ? "animate-spin" : ""} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOutIcon size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="mb-3 font-semibold text-yellow-700">
            Aguardando ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem pedidos</p>
            ) : (
              pending.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-blue-700">
            Em preparo ({inPrep.length})
          </h2>
          <div className="space-y-3">
            {inPrep.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem pedidos</p>
            ) : (
              inPrep.map((o) => <OrderCard key={o.id} order={o} />)
            )}
          </div>
        </div>
      </div>

      {orders.length === 0 && !isPending && (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">Nenhum pedido pendente</p>
          <p className="text-sm text-muted-foreground">
            Atualiza automaticamente a cada 30 segundos
          </p>
        </div>
      )}
    </div>
  );
};

export default KitchenBoard;
