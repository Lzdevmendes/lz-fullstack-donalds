"use client";

import { OrderStatus } from "@prisma/client";
import { BellIcon, ClockIcon, ListIcon, LogOutIcon, PauseCircleIcon, PlayCircleIcon, RefreshCwIcon, UtensilsIcon, XCircleIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import {
  cancelOrder,
  getKitchenOrders,
  getKitchenProducts,
  getRestaurantPauseStatus,
  kitchenLogout,
  kitchenToggleProduct,
  toggleRestaurantPause,
  updateOrderStatus,
} from "./actions";

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const beep = (delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    };
    beep(0);
    beep(0.45);
    setTimeout(() => ctx.close(), 3000);
  } catch {
    // Web Audio não disponível (SSR ou permissão negada)
  }
}

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

function elapsed(date: Date) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  return mins < 1 ? "agora" : `${mins}min`;
}

interface OrderCardProps {
  order: Order;
  updatingId: number | null;
  cancellingId: number | null;
  onAdvance: (order: Order) => void;
  onCancel: (order: Order) => void;
}

const OrderCard = memo(function OrderCard({
  order,
  updatingId,
  cancellingId,
  onAdvance,
  onCancel,
}: OrderCardProps) {
  return (
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
            onClick={() => onAdvance(order)}
          >
            {updatingId === order.id ? "Atualizando..." : STATUS_BTN[order.status]}
          </Button>
        )}

        {(order.status === "PENDING" || order.status === "IN_PREPARATION") && (
          <Button
            variant="outline"
            className="h-11 w-11 shrink-0 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={cancellingId === order.id || updatingId === order.id}
            onClick={() => onCancel(order)}
            aria-label="Cancelar pedido"
          >
            <XCircleIcon size={18} />
          </Button>
        )}
      </div>
    </div>
  );
});

type Tab = "orders" | "products";

interface KitchenProduct {
  id: string;
  name: string;
  isAvailable: boolean;
  menuCategory: { name: string };
}

interface KitchenBoardProps {
  slug: string;
}

const KitchenBoard = ({ slug }: KitchenBoardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<KitchenProduct[]>([]);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [, setTick] = useState(0);
  const knownOrderIds = useRef<Set<number>>(new Set());
  const isFirstFetch = useRef(true);

  const fetchOrders = useCallback(() => {
    startTransition(async () => {
      const data = await getKitchenOrders(slug);
      const incoming = data as Order[];

      if (!isFirstFetch.current && soundEnabled) {
        const newOrders = incoming.filter((o) => !knownOrderIds.current.has(o.id));
        if (newOrders.length > 0) {
          playNotificationSound();
        }
      }
      isFirstFetch.current = false;
      knownOrderIds.current = new Set(incoming.map((o) => o.id));
      setOrders(incoming);
    });
  }, [slug, soundEnabled]);

  const hasActiveOrders = orders.some(
    (o) => o.status === "PENDING" || o.status === "IN_PREPARATION",
  );

  useEffect(() => {
    fetchOrders();
    let interval = setInterval(fetchOrders, hasActiveOrders ? 15_000 : 30_000);

    const handleVisibility = () => {
      clearInterval(interval);
      if (document.visibilityState === "visible") {
        fetchOrders();
        interval = setInterval(fetchOrders, hasActiveOrders ? 15_000 : 30_000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchOrders, hasActiveOrders]);

  useEffect(() => {
    getRestaurantPauseStatus(slug).then(setIsPaused);
  }, [slug]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = useCallback(async (order: Order) => {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    setUpdatingId(order.id);
    await updateOrderStatus(order.id, next);
    fetchOrders();
    setUpdatingId(null);
  }, [fetchOrders]);

  const handleCancel = useCallback(async (order: Order) => {
    if (!confirm(`Cancelar pedido #${order.id}?`)) return;
    setCancellingId(order.id);
    await cancelOrder(order.id);
    fetchOrders();
    setCancellingId(null);
  }, [fetchOrders]);

  const handleLogout = useCallback(async () => {
    await kitchenLogout(slug);
    window.location.reload();
  }, [slug]);

  const fetchProducts = useCallback(() => {
    startTransition(async () => {
      const data = await getKitchenProducts(slug);
      setProducts(data as KitchenProduct[]);
    });
  }, [slug]);

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
  }, [activeTab, fetchProducts]);

  const handleToggleProduct = useCallback(async (product: KitchenProduct) => {
    setTogglingProductId(product.id);
    await kitchenToggleProduct(product.id, !product.isAvailable);
    fetchProducts();
    setTogglingProductId(null);
  }, [fetchProducts]);

  const pending = useMemo(() => orders.filter((o) => o.status === "PENDING"), [orders]);
  const inPrep = useMemo(() => orders.filter((o) => o.status === "IN_PREPARATION"), [orders]);

  const byCategory = useMemo(() => {
    const result: Record<string, KitchenProduct[]> = {};
    for (const p of products) {
      const cat = p.menuCategory.name;
      if (!result[cat]) result[cat] = [];
      result[cat].push(p);
    }
    return result;
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Painel da Cozinha</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`h-11 w-11 rounded-full ${isPaused ? "border-red-500 bg-red-50 text-red-600" : ""}`}
              onClick={async () => {
                await toggleRestaurantPause(slug);
                setIsPaused((v) => !v);
              }}
              title={isPaused ? "Pausado — clique para aceitar pedidos" : "Clique para pausar pedidos"}
            >
              {isPaused ? <PauseCircleIcon size={18} /> : <PlayCircleIcon size={18} />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`h-11 w-11 rounded-full ${soundEnabled ? "" : "opacity-40"}`}
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? "Silenciar alertas" : "Ativar alertas"}
              title={soundEnabled ? "Alertas sonoros: ligado" : "Alertas sonoros: desligado"}
            >
              <BellIcon size={18} />
            </Button>
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

        {/* Tab bar */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition ${
              activeTab === "orders"
                ? "bg-foreground text-background"
                : "bg-gray-100 text-muted-foreground"
            }`}
          >
            <ListIcon size={14} />
            Pedidos
            {pending.length + (orders.filter((o) => o.status === "IN_PREPARATION").length) > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {pending.length + orders.filter((o) => o.status === "IN_PREPARATION").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition ${
              activeTab === "products"
                ? "bg-foreground text-background"
                : "bg-gray-100 text-muted-foreground"
            }`}
          >
            <UtensilsIcon size={14} />
            Produtos
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            {products.length === 0 && !isPending ? (
              <div className="mt-16 text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhum produto cadastrado
                </p>
              </div>
            ) : (
              Object.entries(byCategory).map(([cat, prods]) => (
                <div key={cat} className="mb-5">
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {cat}
                  </h3>
                  <div className="space-y-2">
                    {prods.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm"
                      >
                        <span className={`text-sm font-medium ${!p.isAvailable ? "text-muted-foreground line-through" : ""}`}>
                          {p.name}
                        </span>
                        <button
                          disabled={togglingProductId === p.id}
                          onClick={() => handleToggleProduct(p)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            p.isAvailable
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                        >
                          {togglingProductId === p.id
                            ? "..."
                            : p.isAvailable
                            ? "Disponível"
                            : "Esgotado"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <>
            {isPaused && activeTab === "orders" && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700 text-center">
                ⏸ Pedidos pausados — novos pedidos não estão sendo aceitos
              </div>
            )}
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
                      pending.map((o) => (
                        <OrderCard
                          key={o.id}
                          order={o}
                          updatingId={updatingId}
                          cancellingId={cancellingId}
                          onAdvance={handleAdvanceStatus}
                          onCancel={handleCancel}
                        />
                      ))
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
                      inPrep.map((o) => (
                        <OrderCard
                          key={o.id}
                          order={o}
                          updatingId={updatingId}
                          cancellingId={cancellingId}
                          onAdvance={handleAdvanceStatus}
                          onCancel={handleCancel}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "orders" && orders.length > 0 && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Atualiza a cada {hasActiveOrders ? "15" : "30"} segundos
          </p>
        )}
      </div>
    </div>
  );
};

export default KitchenBoard;
