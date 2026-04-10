"use client";

import { Product } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

import ProductDetails from "./product-details";

interface ProductsProps {
  products: Product[];
}

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  NOVO: { label: "Novo", className: "bg-green-500 text-white" },
  MAIS_PEDIDO: { label: "Mais pedido", className: "bg-primary text-primary-foreground" },
  PROMOCAO: { label: "Promoção", className: "bg-red-500 text-white" },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const Products = ({ products }: ProductsProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="space-y-3 px-5">
        {products.map((product) => {
          const badge = product.badge ? BADGE_CONFIG[product.badge] : null;
          return (
            <div
              key={product.id}
              className="flex cursor-pointer items-center justify-between gap-10 border-b py-3"
              onClick={() => setSelectedProduct(product)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  {badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <p className="pt-3 text-sm font-semibold">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div className="relative min-h-[82px] min-w-[120px]">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
        />
      )}
    </>
  );
};

export default Products;
