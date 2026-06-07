"use client";

import { ConsumptionMethod } from "@prisma/client";
import { CheckCircle2Icon, MinusIcon, PlusIcon, ShoppingBagIcon, TagIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart";
import { useFcmToken } from "@/lib/use-fcm-token";
import { formatCurrency } from "@/lib/utils";

import { createOrder } from "../actions";
import { validateCoupon } from "../coupon-actions";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  consumptionMethod: ConsumptionMethod;
}

type Step = "cart" | "customer";

const CartSheet = ({
  open,
  onOpenChange,
  restaurantId,
  consumptionMethod,
}: CartSheetProps) => {
  const router = useRouter();
  const { items, removeItem, increaseQuantity, decreaseQuantity, total, clearCart, prefilledTable } =
    useCart();
  const fcmToken = useFcmToken();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState(prefilledTable ?? "");

  useEffect(() => {
    if (prefilledTable !== null) setTableNumber(prefilledTable);
  }, [prefilledTable]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [isCouponPending, startCouponTransition] = useTransition();

  const isDineIn = consumptionMethod === "DINE_IN";
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

  const handleProceed = () => {
    if (items.length > 0) setStep("customer");
  };

  const handleOrder = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.name = "Nome é obrigatório";
    if (!isDineIn && !customerPhone.trim())
      newErrors.phone = "Telefone é obrigatório para pedidos para levar";
    if (isDineIn && !tableNumber.trim())
      newErrors.table = "Número da mesa é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const { orderId, slug } = await createOrder({
        restaurantId,
        consumptionMethod,
        items,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        tableNumber: tableNumber ? Number(tableNumber) : undefined,
        couponCode: appliedDiscount !== null ? couponCode : undefined,
        fcmToken: fcmToken ?? undefined,
      });
      clearCart();
      setAppliedDiscount(null);
      setCouponCode("");
      onOpenChange(false);
      setStep("cart");
      router.push(`/${slug}/orders/${orderId}`);
    });
  };

  const handleClose = (open: boolean) => {
    if (!open) setStep("cart");
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl p-0 pb-safe"
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle className="text-base font-semibold">
            {step === "cart" ? "Meu pedido" : "Seus dados"}
          </SheetTitle>
        </SheetHeader>

        {/* ETAPA: CARRINHO */}
        {step === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <ShoppingBagIcon size={28} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Carrinho vazio</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Adicione itens para fazer seu pedido
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5">
                {/* Itens */}
                <div className="space-y-3">
                  {items.map(({ product, quantity, notes }) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3"
                    >
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">{product.name}</p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(product.price)}
                        </p>
                        {notes && (
                          <p className="mt-0.5 truncate text-xs italic text-muted-foreground">
                            {notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(product.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label="Remover item"
                        >
                          <TrashIcon size={13} />
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted active:scale-95"
                            onClick={() => decreaseQuantity(product.id)}
                            aria-label="Diminuir quantidade"
                          >
                            <MinusIcon size={12} />
                          </button>
                          <span className="w-5 text-center text-sm font-bold">{quantity}</span>
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted active:scale-95"
                            onClick={() => increaseQuantity(product.id)}
                            aria-label="Aumentar quantidade"
                          >
                            <PlusIcon size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cupom */}
                <div className="mt-4 rounded-2xl border border-border/60 p-4">
                  {appliedDiscount !== null ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2Icon size={16} />
                        <span className="text-sm font-semibold">
                          {couponCode.toUpperCase()} — {appliedDiscount}% off
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-muted-foreground underline hover:text-foreground"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <TagIcon
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            placeholder="Cupom de desconto"
                            value={couponCode}
                            autoCapitalize="characters"
                            autoCorrect="off"
                            autoComplete="off"
                            onChange={(e) => {
                              setCouponCode(e.target.value);
                              setCouponError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                            className="rounded-xl border-border pl-8 uppercase"
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl"
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

                {/* Total */}
                <div className="mt-4 space-y-1.5 rounded-2xl bg-muted/50 p-4">
                  {appliedDiscount !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-muted-foreground">Subtotal</p>
                      <p className="text-muted-foreground line-through">
                        {formatCurrency(total)}
                      </p>
                    </div>
                  )}
                  {appliedDiscount !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-emerald-700">Desconto ({appliedDiscount}%)</p>
                      <p className="font-medium text-emerald-700">
                        -{formatCurrency(total * (appliedDiscount / 100))}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Total</p>
                    <p className="text-lg font-bold">{formatCurrency(discountedTotal)}</p>
                  </div>
                </div>

                <Button
                  className="mt-4 h-12 w-full rounded-2xl text-sm font-semibold"
                  onClick={handleProceed}
                >
                  Continuar para identificação
                </Button>
              </div>
            )}
          </>
        )}

        {/* ETAPA: DADOS DO CLIENTE */}
        {step === "customer" && (
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Seu nome <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: João Silva"
                autoComplete="name"
                className="rounded-xl border-border"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleOrder()}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {isDineIn ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Número da mesa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  className="rounded-xl border-border"
                  value={tableNumber}
                  onChange={(e) => {
                    setTableNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, table: "" }));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleOrder()}
                />
                {errors.table && (
                  <p className="mt-1 text-xs text-red-500">{errors.table}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  autoComplete="tel"
                  className="rounded-xl border-border"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleOrder()}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            )}

            {/* Resumo do total */}
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">Total do pedido</p>
              <p className="font-bold">{formatCurrency(discountedTotal)}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-2xl border-border"
                onClick={() => setStep("cart")}
              >
                Voltar
              </Button>
              <Button
                className="h-12 flex-1 rounded-2xl text-sm font-semibold"
                onClick={handleOrder}
                disabled={isPending}
              >
                {isPending ? "Processando..." : "Confirmar pedido"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
