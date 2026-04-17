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
import { formatCurrency } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetails = ({
  product,
  open,
  onOpenChange,
}: ProductDetailsProps) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleAddToCart = () => {
    addItem(product, quantity, notes.trim() || undefined);
    onOpenChange(false);
    setQuantity(1);
    setNotes("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-2xl p-0 pb-safe"
      >
        {/* Imagem menor em telas pequenas */}
        <div className="relative h-[200px] w-full bg-gray-100 sm:h-[260px]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6"
          />
        </div>

        <div className="p-5">
          <SheetHeader className="mb-2 text-left">
            <SheetTitle className="text-xl leading-tight">{product.name}</SheetTitle>
          </SheetHeader>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {product.ingredients.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <ChefHatIcon size={15} />
                <h3 className="text-sm font-semibold">Ingredientes</h3>
              </div>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {product.ingredients.map((ingredient) => (
                  <li key={ingredient} className="text-sm text-muted-foreground">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preço + quantidade */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
                aria-label="Diminuir quantidade"
              >
                <MinusIcon size={18} />
              </Button>
              <span className="w-6 text-center text-lg font-bold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar quantidade"
              >
                <PlusIcon size={18} />
              </Button>
            </div>
          </div>

          {/* Observações */}
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium">
              Observações
            </label>
            <textarea
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={2}
              placeholder="Ex: sem cebola, bem passado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            className="mt-4 h-12 w-full rounded-full text-base font-semibold"
            onClick={handleAddToCart}
          >
            Adicionar • {formatCurrency(product.price * quantity)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductDetails;
