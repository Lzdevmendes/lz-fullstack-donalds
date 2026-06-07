"use client";

import { Product } from "@prisma/client";
import { RepeatIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart";

interface OrderAgainButtonProps {
  slug: string;
  consumptionMethod: string;
  products: { product: Product; quantity: number }[];
}

export function OrderAgainButton({ slug, consumptionMethod, products }: OrderAgainButtonProps) {
  const { addItem, clearCart } = useCart();
  const router = useRouter();

  const handleOrderAgain = () => {
    clearCart();
    for (const { product, quantity } of products) {
      addItem(product, quantity);
    }
    router.push(`/${slug}?consumptionMethod=${consumptionMethod}`);
  };

  return (
    <Button
      variant="outline"
      className="h-12 w-full rounded-full gap-2"
      onClick={handleOrderAgain}
    >
      <RepeatIcon size={16} />
      Pedir de novo
    </Button>
  );
}
