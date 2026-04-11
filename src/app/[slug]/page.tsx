import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import RestaurantApp from "./restaurant-app";

interface RestaurantPageProps {
  params: Promise<{ slug: string }>;
}

const RestaurantPage = async ({ params }: RestaurantPageProps) => {
  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      menuCategories: { include: { products: true } },
    },
  });
  if (!restaurant) {
    return notFound();
  }
  return <RestaurantApp restaurant={restaurant} />;
};

export default RestaurantPage;