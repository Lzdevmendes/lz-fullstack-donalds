import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getDateRange, getStartOfToday, ORDER_STATUS_CONFIG } from "@/lib/order-helpers";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

const AnalyticsPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const restaurant = await db.restaurant.findUnique({ where: { id }, select: { name: true } });
  if (!restaurant) return notFound();

  const startOfToday = getStartOfToday();
  const startOf7Days = getDateRange(7);
  const startOf30Days = getDateRange(30);

  const [statsToday, stats7d, stats30d, topProducts, recentOrders] = await Promise.all([
    db.order.aggregate({
      where: { restaurantId: id, createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    db.order.aggregate({
      where: { restaurantId: id, createdAt: { gte: startOf7Days }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    db.order.aggregate({
      where: { restaurantId: id, createdAt: { gte: startOf30Days }, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    db.$queryRaw<{ productId: string; name: string; quantity: number }[]>`
      SELECT op."productId", p.name, SUM(op.quantity)::int AS quantity
      FROM "OrderProduct" op
      JOIN "Product" p ON p.id = op."productId"
      JOIN "Order" o ON o.id = op."orderId"
      WHERE o."restaurantId" = ${id}
        AND o."createdAt" >= ${startOf30Days}
        AND o.status != 'CANCELLED'
      GROUP BY op."productId", p.name
      ORDER BY quantity DESC
      LIMIT 5
    `,
    db.order.findMany({
      where: { restaurantId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        total: true,
        consumptionMethod: true,
        customerName: true,
        tableNumber: true,
        createdAt: true,
      },
    }),
  ]);

  const getOrderStatusLabel = (status: string) => ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || { label: status, color: "" };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={`/admin/restaurants/${id}`}>← Voltar</Link>
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Analytics — {restaurant.name}</h1>
          <a
            href={`/api/admin/restaurants/${id}/export-orders`}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ↓ Exportar CSV
          </a>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Hoje</p>
          <p className="text-2xl font-bold">{formatCurrency(statsToday._sum.total ?? 0)}</p>
          <p className="text-xs text-muted-foreground">{statsToday._count._all} pedidos</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          <p className="text-2xl font-bold">{formatCurrency(stats7d._sum.total ?? 0)}</p>
          <p className="text-xs text-muted-foreground">{stats7d._count._all} pedidos</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          <p className="text-2xl font-bold">{formatCurrency(stats30d._sum.total ?? 0)}</p>
          <p className="text-xs text-muted-foreground">
            Ticket médio: {formatCurrency(stats30d._count._all > 0 ? (stats30d._sum.total ?? 0) / stats30d._count._all : 0)}
          </p>
        </div>
      </div>

      {/* TOP PRODUCTS */}
      <section className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Produtos mais vendidos (30 dias)</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido no período.</p>
        ) : (
          <ul className="space-y-3">
            {topProducts.map((tp, idx) => (
              <li key={tp.productId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium">{tp.name}</span>
                </div>
                <span className="text-sm font-semibold">{tp.quantity} vendas</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RECENT ORDERS */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Pedidos recentes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
        ) : (
          <ul className="divide-y">
            {recentOrders.map((o) => {
              const statusConfig = getOrderStatusLabel(o.status);
              return (
                <li key={o.id} className="flex items-center justify-between py-3 gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      #{o.id}{" "}
                      {o.customerName ? `— ${o.customerName}` : ""}
                      {o.tableNumber ? ` (Mesa ${o.tableNumber})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {o.consumptionMethod === "DINE_IN" ? "Mesa" : "Retirada"} ·{" "}
                      {new Date(o.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-semibold">{formatCurrency(o.total)}</p>
                    <p className={`text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPage;

