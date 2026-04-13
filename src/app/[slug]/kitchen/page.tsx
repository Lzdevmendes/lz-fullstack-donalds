import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";
import { verifyKitchenSession } from "@/lib/session";

import KitchenBoard from "./kitchen-board";
import PasswordGate from "./password-gate";

interface KitchenPageProps {
  params: Promise<{ slug: string }>;
}

const KitchenPage = async ({ params }: KitchenPageProps) => {
  const { slug } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!restaurant) return notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get(`kitchen_${slug}`)?.value;
  const isAuthenticated = !!token && verifyKitchenSession(token) === slug;

  if (!isAuthenticated) {
    return <PasswordGate slug={slug} />;
  }

  return <KitchenBoard slug={slug} />;
};

export default KitchenPage;
