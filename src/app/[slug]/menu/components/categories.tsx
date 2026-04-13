"use client";

import { OpeningHours, Prisma } from "@prisma/client";
import { ClockIcon, SearchIcon, StarIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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

function getOpenStatus(openingHours: OpeningHours[] | undefined): {
  isOpen: boolean;
  label: string;
} {
  if (!openingHours || openingHours.length === 0) {
    return { isOpen: true, label: "Aberto!" };
  }

  const now = new Date();
  const day = now.getDay(); // 0 = domingo, 6 = sábado
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

const RestaurantCategories = ({ restaurant, openingHours }: RestaurantCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<MenuCategoriesWithProducts>(restaurant.menuCategories[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const { isOpen, label } = getOpenStatus(openingHours);

  const allProducts = restaurant.menuCategories.flatMap((c) => c.products);
  const featuredProducts = allProducts.filter((p) => p.badge);

  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null;

  const handleCategoryClick = (category: MenuCategoriesWithProducts) => {
    setSelectedCategory(category);
  };

  const getCategoryButtonVariant = (category: MenuCategoriesWithProducts) => {
    return selectedCategory.id === category.id ? "default" : "secondary";
  };

  return (
    <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-white">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Image
            src={restaurant.avatarImageUrl}
            alt={restaurant.name}
            height={45}
            width={45}
          />
          <div>
            <h2 className="text-lg font-semibold">{restaurant.name}</h2>
            <p className="text-xs opacity-55">{restaurant.description}</p>
          </div>
        </div>
        <div
          className={`mt-3 flex items-center gap-1 text-xs ${
            isOpen ? "text-green-500" : "text-red-500"
          }`}
        >
          <ClockIcon size={12} />
          <p>{label}</p>
        </div>

        <div className="relative mt-4">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar no cardápio..."
            className="pl-9 pr-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              onClick={() => setSearchQuery("")}
              aria-label="Limpar busca"
            >
              <XIcon size={15} />
            </button>
          )}
        </div>
      </div>

      {!filteredProducts && (
        <>
          {featuredProducts.length > 0 && (
            <div className="px-5 pb-2">
              <div className="mb-3 flex items-center gap-2">
                <StarIcon size={14} className="text-primary" />
                <h3 className="font-semibold">Destaques</h3>
              </div>
              <Products products={featuredProducts} />
            </div>
          )}

          <ScrollArea className="w-full">
            <div className="flex w-max space-x-4 p-4 pt-0">
              {restaurant.menuCategories.map((category) => (
                <Button
                  onClick={() => handleCategoryClick(category)}
                  key={category.id}
                  variant={getCategoryButtonVariant(category)}
                  className="h-9 shrink-0 rounded-full px-4 text-sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <h3 className="px-5 pt-2 font-semibold">{selectedCategory.name}</h3>
          <Products products={selectedCategory.products} />
        </>
      )}

      {filteredProducts && (
        <div className="px-5 pt-2">
          <p className="mb-2 text-sm text-muted-foreground">
            {filteredProducts.length === 0
              ? `Nenhum produto encontrado para "${searchQuery}"`
              : `${filteredProducts.length} resultado${filteredProducts.length > 1 ? "s" : ""} para "${searchQuery}"`}
          </p>
          <Products products={filteredProducts} />
        </div>
      )}
    </div>
  );
};

export default RestaurantCategories;
