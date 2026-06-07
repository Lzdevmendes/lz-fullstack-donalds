"use client";

import { Product } from "@prisma/client";
import { ChefHatIcon, MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/cart";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailsProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetails = memo(function ProductDetails({
  product,
  open,
  onOpenChange,
}: ProductDetailsProps) {
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
        className="max-h-[90vh] overflow-y-auto rounded-t-3xl p-0 pb-safe"
      >
        {/* Imagem do produto */}
        <div className="relative h-[230px] w-full overflow-hidden sm:h-[270px]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
          {/* Gradiente sutil no rodapé da imagem para transição */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/30 to-transparent" />
        </div>

        <div className="p-5 pb-2">
          <SheetHeader className="mb-3 text-left">
            <SheetTitle className="text-xl font-bold leading-tight">{product.name}</SheetTitle>
          </SheetHeader>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Ingredientes */}
          {product.ingredients.length > 0 && (
            <div className="mt-5 rounded-2xl bg-muted/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ChefHatIcon size={14} className="text-primary" />
                <h3 className="text-sm font-semibold">Ingredientes</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preço + quantidade */}
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Preço unitário</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(product.price)}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-border"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
                aria-label="Diminuir quantidade"
              >
                <MinusIcon size={16} />
              </Button>
              <span className="w-8 text-center text-lg font-bold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-border"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar quantidade"
              >
                <PlusIcon size={16} />
              </Button>
            </div>
          </div>

          {/* Observações */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Observações <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Textarea
              rows={2}
              placeholder="Ex: sem cebola, bem passado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-0 rounded-xl border-border text-sm leading-relaxed"
            />
          </div>

          {/* Botão adicionar */}
          <Button
            className="mt-5 h-13 w-full rounded-2xl text-sm font-semibold"
            onClick={handleAddToCart}
          >
            <span>Adicionar ao pedido</span>
            <span className="ml-auto font-bold">
              {formatCurrency(product.price * quantity)}
            </span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default ProductDetails;
