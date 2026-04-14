import { notFound } from "next/navigation";
import { Suspense } from "react";

import { db } from "@/lib/prisma";

import RestaurantLoading from "./loading";
import RestaurantApp from "./restaurant-app";

interface RestaurantPageProps {
  params: Promise<{ slug: string }>;
}

const RestaurantPage = async ({ params }: RestaurantPageProps) => {
  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      menuCategories: {
        include: { products: { where: { isAvailable: true } } },
      },
      openingHours: true,
    },
  });
  if (!restaurant) {
    return notFound();
  }
  return (
    <Suspense fallback={<RestaurantLoading />}>
      <RestaurantApp restaurant={restaurant} isPaused={restaurant.isPaused} />
    </Suspense>
  );
};

export default RestaurantPage;