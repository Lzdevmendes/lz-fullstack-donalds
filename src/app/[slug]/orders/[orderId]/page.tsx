import { ClockIcon, PhoneIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

import OrderStatusPoller from "./components/order-status-poller";
import RatingForm from "./components/rating-form";

interface OrderConfirmationPageProps {
  params: Promise<{ slug: string; orderId: string }>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const OrderConfirmationPage = async ({
  params,
}: OrderConfirmationPageProps) => {
  const { slug, orderId } = await params;

  const orderIdNum = Number(orderId);
  if (isNaN(orderIdNum)) return notFound();

  const order = await db.order.findUnique({
    where: { id: orderIdNum },
    include: {
      restaurant: true,
      orderProducts: { include: { product: true } },
      rating: { select: { id: true } },
    },
  });

  if (!order) return notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <ClockIcon className="text-green-600" size={32} />
        </div>
        <h1 className="text-2xl font-semibold">Pedido realizado!</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o status do seu pedido abaixo em tempo real.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border p-5 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="text-xs text-muted-foreground">Pedido</p>
            <p className="font-semibold">#{order.id}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {order.restaurant.name}
          </p>
        </div>

        {(order.customerName || order.tableNumber || order.customerPhone) && (
          <div className="space-y-1 border-b py-4">
            {order.customerName && (
              <div className="flex items-center gap-2 text-sm">
                <UserIcon size={15} className="shrink-0 text-muted-foreground" />
                <span>{order.customerName}</span>
              </div>
            )}
            {order.tableNumber && (
              <p className="text-sm text-muted-foreground">
                Mesa {order.tableNumber}
              </p>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PhoneIcon size={15} className="shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
            )}
          </div>
        )}

        <div className="border-b py-4">
          <p className="mb-3 text-xs text-muted-foreground">Itens</p>
          <div className="space-y-2">
            {order.orderProducts.map(({ id, product, quantity, price }) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <span>
                  {quantity}x {product.name}
                </span>
                <span className="font-medium">
                  {formatCurrency(price * quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b py-4">
          <p className="font-semibold">Total</p>
          <p className="font-semibold">{formatCurrency(order.total)}</p>
        </div>

        <div className="pt-5">
          <p className="mb-4 text-sm font-semibold">Status do pedido</p>
          <OrderStatusPoller
            orderId={order.id}
            initialStatus={order.status}
          />
        </div>

        {order.status === "FINISHED" && !order.rating && (
          <RatingForm orderId={order.id} />
        )}
      </div>

      <Button asChild className="w-full max-w-sm rounded-full">
        <Link href={`/${slug}`}>Fazer novo pedido</Link>
      </Button>
    </div>
  );
};

export default OrderConfirmationPage;
