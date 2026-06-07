"use client";

import { OpeningHours, Prisma } from "@prisma/client";
import { ClockIcon, SearchIcon, SparklesIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useDeferredValue, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import Products from "./products";

interface RestaurantCategoriesProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true };
      };
    };
  }>;
  openingHours?: OpeningHours[];
}

type MenuCategoriesWithProducts = Prisma.MenuCategoryGetPayload<{
  include: { products: true };
}>;

function getOpenStatus(
  openingHours: OpeningHours[] | undefined,
  now = new Date(),
): {
  isOpen: boolean;
  label: string;
} {
  if (!openingHours || openingHours.length === 0) {
    return { isOpen: true, label: "Aberto!" };
  }

  const day = now.getDay();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;

  const todayHours = openingHours.find((h) => h.dayOfWeek === day);

  if (!todayHours || todayHours.isClosed) {
    return { isOpen: false, label: "Fechado hoje" };
  }

  if (currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime) {
    return {
      isOpen: true,
      label: `Aberto até ${todayHours.closeTime}`,
    };
  }

  if (currentTime < todayHours.openTime) {
    return {
      isOpen: false,
      label: `Abre às ${todayHours.openTime}`,
    };
  }

  return { isOpen: false, label: "Fechado agora" };
}

const CATEGORY_EMOJI: Record<string, string> = {
  "entradas": "🥗",
  "frutos do mar": "🦑",
  "peixes": "🐟",
  "pizzas": "🍕",
  "acompanhamentos": "🍚",
  "bebidas": "🍹",
  "sobremesas": "🍮",
  "combos": "🎁",
  "lanches": "🍔",
  "fritas": "🍟",
  "carnes": "🥩",
  "saladas": "🥗",
  "massas": "🍝",
  "risotos": "🍚",
  "grelhados": "🥩",
  "doces": "🍬",
  "sucos": "🥤",
  "cervejas": "🍺",
};

const getCategoryEmoji = (name: string): string =>
  CATEGORY_EMOJI[name.toLowerCase().trim()] ?? "🍽️";

const RestaurantCategories = ({ restaurant, openingHours }: RestaurantCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<MenuCategoriesWithProducts>(restaurant.menuCategories[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const msUntilNextMinute =
      (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds();

    const timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const { isOpen, label } = useMemo(() => getOpenStatus(openingHours, now), [openingHours, now]);

  const allProducts = useMemo(
    () => restaurant.menuCategories.flatMap((c) => c.products),
    [restaurant.menuCategories],
  );

  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.badge),
    [allProducts],
  );

  const filteredProducts = useMemo(
    () =>
      deferredQuery.trim()
        ? allProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(deferredQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(deferredQuery.toLowerCase()),
          )
        : null,
    [deferredQuery, allProducts],
  );

  return (
    <div className="relative z-50 -mt-5 rounded-t-3xl bg-background shadow-[0_-4px_24px_0_rgb(0_0_0/0.06)]">
      {/* Info do restaurante */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image
              src={restaurant.avatarImageUrl}
              alt={restaurant.name}
              height={48}
              width={48}
              priority
              className="rounded-2xl shadow-sm"
            />
            {/* Indicador de status no avatar */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                isOpen ? "bg-green-500" : "bg-red-400"
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold leading-tight">{restaurant.name}</h2>
            <p className="truncate text-xs text-muted-foreground">{restaurant.description}</p>
          </div>
        </div>

        {/* Badge de horário */}
        <div
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            isOpen
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          <ClockIcon size={11} />
          <span>{label}</span>
        </div>

        {/* Busca */}
        <div className="relative mt-4">
          <SearchIcon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar no cardápio..."
            className="rounded-xl border-border bg-card pl-9 pr-9 shadow-none focus-visible:ring-primary/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setSearchQuery("")}
              aria-label="Limpar busca"
            >
              <XIcon size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Resultado da busca */}
      {filteredProducts && (
        <div className="px-5 pb-6">
          <p className="mb-4 text-sm text-muted-foreground">
            {filteredProducts.length === 0
              ? `Nenhum produto encontrado para "${searchQuery}"`
              : `${filteredProducts.length} resultado${filteredProducts.length > 1 ? "s" : ""} para "${searchQuery}"`}
          </p>
          <Products products={filteredProducts} />
        </div>
      )}

      {/* Conteúdo normal (sem busca) */}
      {!filteredProducts && (
        <>
          {/* Destaques */}
          {featuredProducts.length > 0 && (
            <div className="px-5 pb-4">
              <div className="mb-3 flex items-center gap-2">
                <SparklesIcon size={14} className="text-primary" />
                <h3 className="text-sm font-semibold">Destaques</h3>
              </div>
              <Products products={featuredProducts} />
            </div>
          )}

          {/* Categorias */}
          <ScrollArea className="w-full">
            <div className="flex w-max gap-2 px-5 pb-3">
              {restaurant.menuCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all duration-200 ${
                    selectedCategory.id === category.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span>{getCategoryEmoji(category.name)}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="px-5 pb-1 pt-2">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground/80">
              <span>{getCategoryEmoji(selectedCategory.name)}</span>
              <span>{selectedCategory.name}</span>
            </h3>
          </div>
          <Products products={selectedCategory.products} />
        </>
      )}

      {/* Espaço para bottom navigation / home bar */}
      <div className="pb-safe h-8" />
    </div>
  );
};

export default RestaurantCategories;
