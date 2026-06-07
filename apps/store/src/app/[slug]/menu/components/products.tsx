"use client";

import { Product } from "@prisma/client";
import Image from "next/image";
import { memo, useState } from "react";

import { formatCurrency } from "@/lib/utils";

import ProductDetails from "./product-details";

interface ProductsProps {
  products: Product[];
}

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  NOVO: {
    label: "Novo",
    className: "bg-emerald-500 text-white",
  },
  MAIS_PEDIDO: {
    label: "🔥 Mais pedido",
    className: "bg-primary text-primary-foreground",
  },
  PROMOCAO: {
    label: "Promoção",
    className: "bg-red-500 text-white",
  },
};

const Products = memo(function Products({ products }: ProductsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-sm text-muted-foreground">Nenhum produto disponível nesta categoria</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border/60">
        {products.map((product) => {
          const badge = product.badge ? BADGE_CONFIG[product.badge] : null;
          return (
            <button
              key={product.id}
              type="button"
              aria-label={`Ver detalhes de ${product.name}`}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-muted/40 active:bg-muted/70"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
                  {badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-[90px] sm:w-[90px]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 80px, 90px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </button>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductDetails
          key={selectedProduct.id}
          product={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
        />
      )}
    </>
  );
});

export default Products;
