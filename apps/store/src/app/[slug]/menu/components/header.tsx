"use client";

import { ConsumptionMethod, Restaurant } from "@prisma/client";
import { ArrowLeftIcon, ShoppingBagIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/contexts/cart";

import CartSheet from "./cart-sheet";

interface RestaurantHeaderProps {
  restaurant: Pick<Restaurant, "id" | "name" | "coverImageUrl">;
  consumptionMethod: ConsumptionMethod;
  onBack?: () => void;
}

const RestaurantHeader = ({
  restaurant,
  consumptionMethod,
  onBack,
}: RestaurantHeaderProps) => {
  const router = useRouter();
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <div className="relative h-[220px] w-full overflow-hidden sm:h-[260px]">
        <Image
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Gradiente inferior para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Gradiente superior para os botões */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {/* Botão voltar */}
        <button
          onClick={onBack ?? (() => router.back())}
          className="absolute left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all hover:bg-black/50 active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeftIcon size={18} />
        </button>

        {/* Botão carrinho */}
        <button
          className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all hover:bg-black/50 active:scale-95"
          onClick={() => setCartOpen(true)}
          aria-label="Abrir carrinho"
        >
          <ShoppingBagIcon size={18} />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-white">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </div>

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        restaurantId={restaurant.id}
        consumptionMethod={consumptionMethod}
      />
    </>
  );
};

export default RestaurantHeader;
