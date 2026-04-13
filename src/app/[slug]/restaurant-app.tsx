"use client";

import { ConsumptionMethod, Prisma } from "@prisma/client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ConsumptionMethodOption from "./components/consumption-method-option";
import RestaurantCategories from "./menu/components/categories";
import RestaurantHeader from "./menu/components/header";
import OrderHistoryPage from "./orders/page";

type Page = "welcome" | "menu" | "orders";

type RestaurantWithMenu = Prisma.RestaurantGetPayload<{
  include: {
    menuCategories: { include: { products: true } };
    openingHours: true;
  };
}>;

interface RestaurantAppProps {
  restaurant: RestaurantWithMenu;
}

const VALID_METHODS: ConsumptionMethod[] = ["DINE_IN", "TAKEAWAY"];

export default function RestaurantApp({ restaurant }: RestaurantAppProps) {
  const searchParams = useSearchParams();
  const [page, setPage] = useState<Page>("welcome");
  const [consumptionMethod, setConsumptionMethod] =
    useState<ConsumptionMethod>("DINE_IN");

  useEffect(() => {
    const method = searchParams.get("consumptionMethod")?.toUpperCase();
    if (method && VALID_METHODS.includes(method as ConsumptionMethod)) {
      setConsumptionMethod(method as ConsumptionMethod);
      setPage("menu");
    }
  }, [searchParams]);

  if (page === "menu") {
    return (
      <div>
        <RestaurantHeader
          restaurant={restaurant}
          consumptionMethod={consumptionMethod}
          onBack={() => setPage("welcome")}
        />
        <RestaurantCategories
          restaurant={restaurant}
          openingHours={restaurant.openingHours}
        />
      </div>
    );
  }

  if (page === "orders") {
    return <OrderHistoryPage onBack={() => setPage("welcome")} />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 pt-safe">
      {/* Logo e nome */}
      <div className="flex flex-col items-center gap-3">
        <Image
          src={restaurant.avatarImageUrl}
          alt={restaurant.name}
          width={90}
          height={90}
          className="rounded-2xl shadow-sm"
        />
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
      </div>

      {/* Boas-vindas */}
      <div className="mt-10 max-w-xs space-y-2 text-center">
        <h3 className="text-2xl font-bold">Seja bem-vindo!</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Escolha como prefere aproveitar sua refeição.
        </p>
      </div>

      {/* Opções de consumo */}
      <div className="mt-8 grid w-full max-w-xs grid-cols-2 gap-4">
        <ConsumptionMethodOption
          buttonText="Comer aqui"
          imageAlt="Comer aqui"
          imageUrl="/dine_in.png"
          onClick={() => {
            setConsumptionMethod("DINE_IN");
            setPage("menu");
          }}
        />
        <ConsumptionMethodOption
          buttonText="Para levar"
          imageAlt="Para levar"
          imageUrl="/takeaway.png"
          onClick={() => {
            setConsumptionMethod("TAKEAWAY");
            setPage("menu");
          }}
        />
      </div>

      {/* Link pedidos anteriores */}
      <button
        onClick={() => setPage("orders")}
        className="mt-8 rounded-full px-4 py-2 text-sm text-muted-foreground underline-offset-2 hover:underline active:opacity-70"
      >
        Ver meus pedidos anteriores
      </button>
    </div>
  );
}
