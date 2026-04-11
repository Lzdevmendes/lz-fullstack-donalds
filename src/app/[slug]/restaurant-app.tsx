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
  include: { menuCategories: { include: { products: true } } };
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
        <RestaurantCategories restaurant={restaurant} />
      </div>
    );
  }

  if (page === "orders") {
    return <OrderHistoryPage onBack={() => setPage("welcome")} />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center px-6 pt-24">
      <div className="flex flex-col items-center gap-2">
        <Image
          src={restaurant.avatarImageUrl}
          alt={restaurant.name}
          width={82}
          height={82}
        />
        <h2 className="font-semibold">{restaurant.name}</h2>
      </div>
      <div className="space-y-2 pt-24 text-center">
        <h3 className="text-2xl font-semibold">Seja bem-vindo!</h3>
        <p className="opacity-55">
          Escolha como prefere aproveitar sua refeição. Estamos aqui para
          oferecer praticidade e sabor em cada detalhe!
        </p>
      </div>
      <div className="mt-6 w-full">
        <button
          onClick={() => setPage("orders")}
          className="block w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          Ver meus pedidos anteriores
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-8">
        <ConsumptionMethodOption
          buttonText="Para comer aqui"
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
    </div>
  );
}
