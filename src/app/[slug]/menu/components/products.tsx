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
  NOVO: { label: "Novo", className: "bg-green-500 text-white" },
  MAIS_PEDIDO: { label: "Mais pedido", className: "bg-primary text-primary-foreground" },
  PROMOCAO: { label: "Promoção", className: "bg-red-500 text-white" },
};

const Products = memo(function Products({ products }: ProductsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="space-y-3 px-5">
        {products.map((product) => {
          const badge = product.badge ? BADGE_CONFIG[product.badge] : null;
          return (
            <button
              key={product.id}
              type="button"
              aria-label={`Ver detalhes de ${product.name}`}
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-b py-4 text-left active:bg-gray-50"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold leading-snug">{product.name}</h3>
                  {badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-2 text-sm font-bold">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[100px] sm:w-[110px]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 88px, 110px"
                  className="rounded-xl object-contain"
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
