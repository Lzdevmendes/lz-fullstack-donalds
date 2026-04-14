import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const AnalyticsPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const restaurant = await db.restaurant.findUnique({ where: { id }, select: { name: true } });
  if (!restaurant) return notFound();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOf30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [ordersToday, orders7d, orders30d, topProducts, recentOrders] = await Promise.all([
    db.order.findMany({
      where: { restaurantId: id, createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    db.order.findMany({
      where: { restaurantId: id, createdAt: { gte: startOf7Days }, status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    db.order.findMany({
      where: { restaurantId: id, createdAt: { gte: startOf30Days }, status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    db.orderProduct.groupBy({
      by: ["productId"],
      where: { order: { restaurantId: id, createdAt: { gte: startOf30Days }, status: { not: "CANCELLED" } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
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

  const topProductIds = topProducts.map((p) => p.productId);
  const topProductDetails = await db.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });
  const productNameMap = Object.fromEntries(topProductDetails.map((p) => [p.id, p.name]));

  const sumTotal = (orders: { total: number }[]) =>
    orders.reduce((acc, o) => acc + o.total, 0);

  const avgOrder = (orders: { total: number }[]) =>
    orders.length ? sumTotal(orders) / orders.length : 0;

  const STATUS_LABEL: Record<string, string> = {
    PENDING: "Aguardando",
    IN_PREPARATION: "Em preparo",
    FINISHED: "Pronto",
    CANCELLED: "Cancelado",
  };

  const STATUS_COLOR: Record<string, string> = {
    PENDING: "text-yellow-600",
    IN_PREPARATION: "text-blue-600",
    FINISHED: "text-green-600",
    CANCELLED: "text-red-500",
  };

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
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Hoje</p>
          <p className="text-2xl font-bold">{formatCurrency(sumTotal(ordersToday))}</p>
          <p className="text-xs text-muted-foreground">{ordersToday.length} pedidos</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          <p className="text-2xl font-bold">{formatCurrency(sumTotal(orders7d))}</p>
          <p className="text-xs text-muted-foreground">{orders7d.length} pedidos</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          <p className="text-2xl font-bold">{formatCurrency(sumTotal(orders30d))}</p>
          <p className="text-xs text-muted-foreground">
            Ticket médio: {formatCurrency(avgOrder(orders30d))}
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
                  <span className="text-sm font-medium">
                    {productNameMap[tp.productId] ?? "Produto removido"}
                  </span>
                </div>
                <span className="text-sm font-semibold">{tp._sum.quantity ?? 0} vendas</span>
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
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">
                    #{o.id}{" "}
                    {o.customerName ? `— ${o.customerName}` : ""}
                    {o.tableNumber ? ` (Mesa ${o.tableNumber})` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.consumptionMethod === "DINE_IN" ? "Mesa" : "Retirada"} ·{" "}
                    {new Date(o.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(o.total)}</p>
                  <p className={`text-xs font-medium ${STATUS_COLOR[o.status] ?? ""}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPage;
