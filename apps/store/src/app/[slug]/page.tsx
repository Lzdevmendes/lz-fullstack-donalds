import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { db } from "@/lib/prisma";

import RestaurantLoading from "./loading";
import RestaurantApp from "./restaurant-app";

interface RestaurantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true, description: true, avatarImageUrl: true },
  });
  if (!restaurant) return {};
  return {
    title: restaurant.name,
    description: restaurant.description,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description,
      images: restaurant.avatarImageUrl ? [restaurant.avatarImageUrl] : [],
    },
  };
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
