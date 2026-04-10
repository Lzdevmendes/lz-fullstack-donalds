"use client";

import { ConsumptionMethod } from "@prisma/client";
import { CheckCircleIcon, MinusIcon, PlusIcon, TagIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart";

import { createOrder } from "../actions";
import { validateCoupon } from "../coupon-actions";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  consumptionMethod: ConsumptionMethod;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const CartSheet = ({
  open,
  onOpenChange,
  restaurantId,
  consumptionMethod,
}: CartSheetProps) => {
  const router = useRouter();
  const { items, removeItem, increaseQuantity, decreaseQuantity, total, clearCart } =
    useCart();
  const [isPending, startTransition] = useTransition();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [isCouponPending, startCouponTransition] = useTransition();

  const discountedTotal =
    appliedDiscount !== null ? total * (1 - appliedDiscount / 100) : total;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    startCouponTransition(async () => {
      const result = await validateCoupon(couponCode, restaurantId);
      if (result.valid) {
        setAppliedDiscount(result.discountPercent);
        setCouponError("");
      } else {
        setAppliedDiscount(null);
        setCouponError(result.error);
      }
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleOrder = () => {
    startTransition(async () => {
      const { orderId, slug } = await createOrder({
        slug: "",
        restaurantId,
        consumptionMethod,
        items,
        couponCode: appliedDiscount !== null ? couponCode : undefined,
      });
      clearCart();
      setAppliedDiscount(null);
      setCouponCode("");
      onOpenChange(false);
      router.push(`/${slug}/orders/${orderId}`);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b p-5 pb-4">
          <SheetTitle>Meu pedido</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="font-semibold">Seu carrinho está vazio</p>
            <p className="text-sm text-muted-foreground">
              Adicione itens para fazer seu pedido
            </p>
          </div>
        ) : (
          <div className="p-5">
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => decreaseQuantity(product.id)}
                    >
                      <MinusIcon size={12} />
                    </Button>
                    <span className="w-5 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => increaseQuantity(product.id)}
                    >
                      <PlusIcon size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-red-500 hover:text-red-600"
                      onClick={() => removeItem(product.id)}
                    >
                      <TrashIcon size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* COUPON SECTION */}
            <div className="mt-4 border-t pt-4">
              {appliedDiscount !== null ? (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon size={16} />
                    <span className="text-sm font-medium">
                      {couponCode.toUpperCase()} — {appliedDiscount}% de desconto
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-green-600 underline"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        placeholder="Cupom de desconto"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className="pl-8 uppercase"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isCouponPending || !couponCode.trim()}
                    >
                      {isCouponPending ? "..." : "Aplicar"}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="mt-4 space-y-1 border-t pt-4">
              {appliedDiscount !== null && (
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="text-muted-foreground line-through">
                    {formatCurrency(total)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">{formatCurrency(discountedTotal)}</p>
              </div>
            </div>

            <Button
              className="mt-5 w-full rounded-full"
              onClick={handleOrder}
              disabled={isPending}
            >
              {isPending ? "Processando..." : "Fazer pedido"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
