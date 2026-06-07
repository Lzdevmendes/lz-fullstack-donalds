import { MapPinIcon, PhoneIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

import { OrderAgainButton } from "./components/order-again-button";
import OrderStatusPoller from "./components/order-status-poller";
import RatingForm from "./components/rating-form";
import { WhatsAppButton } from "./components/whatsapp-button";

interface OrderConfirmationPageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

const OrderConfirmationPage = async ({
  params,
}: OrderConfirmationPageProps) => {
  const { slug, orderId } = await params;

  const orderIdNum = Number(orderId);
  if (isNaN(orderIdNum)) return notFound();

  const order = await db.order.findUnique({
    where: { id: orderIdNum },
    include: {
      restaurant: { select: { name: true, slug: true } },
      orderProducts: { include: { product: true } },
      rating: { select: { id: true } },
    },
  });

  if (!order) return notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Header com fundo degradê */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-background px-6 pb-8 pt-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-md">
            <span className="text-3xl">🎉</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Pedido confirmado!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe em tempo real abaixo
            </p>
          </div>
          <span className="rounded-full bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm border border-border/60">
            Pedido #{order.id} · {order.restaurant.name}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-sm space-y-4 px-4 py-5">
        {/* Status do pedido */}
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="mb-5 text-sm font-semibold">Status do pedido</p>
          <OrderStatusPoller
            orderId={order.id}
            initialStatus={order.status}
          />
        </div>

        {/* Dados do cliente */}
        {(order.customerName || order.tableNumber || order.customerPhone) && (
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold">Seus dados</p>
            <div className="space-y-2">
              {order.customerName && (
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <UserIcon size={13} className="text-muted-foreground" />
                  </div>
                  <span>{order.customerName}</span>
                </div>
              )}
              {order.tableNumber && (
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <MapPinIcon size={13} className="text-muted-foreground" />
                  </div>
                  <span>Mesa {order.tableNumber}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <PhoneIcon size={13} className="text-muted-foreground" />
                  </div>
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Itens do pedido */}
        <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold">Itens</p>
          <div className="divide-y divide-border/60">
            {order.orderProducts.map(({ id, product, quantity, price }) => (
              <div key={id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{quantity}×</span> {product.name}
                </span>
                <span className="font-semibold">{formatCurrency(price * quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
            <p className="text-sm font-semibold">Total</p>
            <p className="text-base font-bold">{formatCurrency(order.total)}</p>
          </div>
        </div>

        {/* Avaliação */}
        {order.status === "FINISHED" && !order.rating && (
          <RatingForm orderId={order.id} />
        )}

        {/* Ações */}
        <div className="space-y-2.5 pb-safe">
          <WhatsAppButton order={order} />
          <OrderAgainButton
            slug={slug}
            consumptionMethod={order.consumptionMethod}
            products={order.orderProducts.map((op) => ({ product: op.product, quantity: op.quantity }))}
          />
          <Button asChild variant="ghost" className="h-12 w-full rounded-2xl text-sm text-muted-foreground">
            <Link href={`/${slug}`}>← Voltar ao cardápio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
