"use client";

import { Product } from "@prisma/client";
import { ChefHatIcon, MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart";

interface ProductDetailsProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const ProductDetails = ({
  product,
  open,
  onOpenChange,
}: ProductDetailsProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, notes.trim() || undefined);
    }
    onOpenChange(false);
    setQuantity(1);
    setNotes("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-2xl p-0"
      >
        <div className="relative h-[300px] w-full bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-8"
          />
        </div>

        <div className="p-5">
          <SheetHeader className="mb-3 text-left">
            <SheetTitle className="text-xl">{product.name}</SheetTitle>
          </SheetHeader>

          <p className="text-sm text-muted-foreground">{product.description}</p>

          {product.ingredients.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <ChefHatIcon size={16} />
                <h3 className="text-sm font-semibold">Ingredientes</h3>
              </div>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {product.ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="text-sm text-muted-foreground"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <p className="text-xl font-semibold">
              {formatCurrency(product.price)}
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <MinusIcon size={16} />
              </Button>
              <span className="w-5 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <PlusIcon size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium">
              Observações
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={2}
              placeholder="Ex: sem cebola, bem passado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            className="mt-4 w-full rounded-full"
            onClick={handleAddToCart}
          >
            Adicionar ao carrinho •{" "}
            {formatCurrency(product.price * quantity)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductDetails;
