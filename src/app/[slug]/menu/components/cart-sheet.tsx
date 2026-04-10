"use client";

import { ConsumptionMethod } from "@prisma/client";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
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

type Step = "cart" | "customer";

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
  const [step, setStep] = useState<Step>("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDineIn = consumptionMethod === "DINE_IN";

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
        slug: "",
        restaurantId,
        consumptionMethod,
        items,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        tableNumber: tableNumber ? Number(tableNumber) : undefined,
      });
      clearCart();
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
        className="max-h-[90vh] overflow-y-auto rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b p-5 pb-4">
          <SheetTitle>
            {step === "cart" ? "Meu pedido" : "Seus dados"}
          </SheetTitle>
        </SheetHeader>

        {step === "cart" && (
          <>
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
                  {items.map(({ product, quantity, notes }) => (
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
                        {notes && (
                          <p className="mt-0.5 text-xs italic text-muted-foreground">
                            {notes}
                          </p>
                        )}
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

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold">{formatCurrency(total)}</p>
                </div>

                <Button
                  className="mt-5 w-full rounded-full"
                  onClick={handleProceed}
                >
                  Continuar
                </Button>
              </div>
            )}
          </>
        )}

        {step === "customer" && (
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Seu nome <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: João Silva"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {isDineIn ? (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Número da mesa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  value={tableNumber}
                  onChange={(e) => {
                    setTableNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, table: "" }));
                  }}
                />
                {errors.table && (
                  <p className="mt-1 text-xs text-red-500">{errors.table}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-sm text-muted-foreground">Total do pedido</p>
              <p className="font-semibold">{formatCurrency(total)}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setStep("cart")}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 rounded-full"
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
