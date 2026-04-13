"use client";

import { OrderStatus } from "@prisma/client";
import { ClockIcon, LogOutIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import {
  cancelOrder,
  getKitchenOrders,
  kitchenLogout,
  updateOrderStatus,
} from "./actions";

interface OrderProduct {
  quantity: number;
  notes?: string | null;
  product: { name: string };
}

interface Order {
  id: number;
  status: OrderStatus;
  consumptionMethod: string;
  customerName?: string | null;
  tableNumber?: number | null;
  createdAt: Date;
  orderProducts: OrderProduct[];
}

const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "IN_PREPARATION",
  IN_PREPARATION: "FINISHED",
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
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchOrders = useCallback(() => {
    startTransition(async () => {
      const data = await getKitchenOrders(slug);
      setOrders(data as Order[]);
    });
  }, [slug]);

  const hasActiveOrders = orders.some(
    (o) => o.status === "PENDING" || o.status === "IN_PREPARATION",
  );

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, hasActiveOrders ? 15_000 : 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders, hasActiveOrders]);

  const handleAdvanceStatus = async (order: Order) => {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    setUpdatingId(order.id);
    await updateOrderStatus(order.id, next);
    fetchOrders();
    setUpdatingId(null);
  };

  const handleCancel = async (order: Order) => {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return;
    setCancellingId(order.id);
    await cancelOrder(order.id);
    fetchOrders();
    setCancellingId(null);
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
        order.status === "PENDING"
          ? "border-yellow-200 bg-yellow-50"
          : "border-blue-200 bg-blue-50"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base font-bold">#{order.id}</span>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <ClockIcon size={13} />
          {elapsed(order.createdAt)}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {METHOD_LABEL[order.consumptionMethod] ?? order.consumptionMethod}
          {order.tableNumber ? ` · Mesa ${order.tableNumber}` : ""}
        </p>
        {order.customerName && (
          <p className="text-sm font-medium">{order.customerName}</p>
        )}
      </div>

      <ul className="mb-4 space-y-2">
        {order.orderProducts.map((op, i) => (
          <li key={i} className="text-sm">
            <span className="font-semibold">
              {op.quantity}x {op.product.name}
            </span>
            {op.notes && (
              <p className="mt-0.5 text-xs text-muted-foreground">↳ {op.notes}</p>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        {STATUS_NEXT[order.status] && (
          <Button
            className="h-11 flex-1 rounded-full text-sm"
            disabled={updatingId === order.id || cancellingId === order.id}
            onClick={() => handleAdvanceStatus(order)}
          >
            {updatingId === order.id ? "Atualizando..." : STATUS_BTN[order.status]}
          </Button>
        )}

        {(order.status === "PENDING" || order.status === "IN_PREPARATION") && (
          <Button
            variant="outline"
            className="h-11 w-11 shrink-0 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={cancellingId === order.id || updatingId === order.id}
            onClick={() => handleCancel(order)}
            aria-label="Cancelar pedido"
          >
            <XCircleIcon size={18} />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Painel da Cozinha</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={fetchOrders}
              disabled={isPending}
              aria-label="Atualizar"
            >
              <RefreshCwIcon size={18} className={isPending ? "animate-spin" : ""} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={handleLogout}
              aria-label="Sair"
            >
              <LogOutIcon size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {orders.length === 0 && !isPending ? (
          <div className="mt-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum pedido pendente
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualiza automaticamente a cada 30 segundos
            </p>
          </div>
        ) : (
          /* Mobile: stacked columns, tablet+: side by side */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-yellow-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold">
                  {pending.length}
                </span>
                Aguardando
              </h2>
              <div className="space-y-3">
                {pending.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Sem pedidos aguardando
                  </p>
                ) : (
                  pending.map((o) => <OrderCard key={o.id} order={o} />)
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-blue-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold">
                  {inPrep.length}
                </span>
                Em preparo
              </h2>
              <div className="space-y-3">
                {inPrep.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Nada em preparo
                  </p>
                ) : (
                  inPrep.map((o) => <OrderCard key={o.id} order={o} />)
                )}
              </div>
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Atualiza a cada {hasActiveOrders ? "15" : "30"} segundos
          </p>
        )}
      </div>
    </div>
  );
};

export default KitchenBoard;
