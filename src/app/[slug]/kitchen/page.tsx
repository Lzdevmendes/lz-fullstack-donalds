import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import KitchenBoard from "./kitchen-board";
import PasswordGate from "./password-gate";

interface KitchenPageProps {
  params: Promise<{ slug: string }>;
}

const KitchenPage = async ({ params }: KitchenPageProps) => {
  const { slug } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true, kitchenPassword: true },
  });

  if (!restaurant) return notFound();

  const cookieStore = await cookies();
  const auth = cookieStore.get(`kitchen_${slug}`)?.value;
  const isAuthenticated = auth === restaurant.kitchenPassword;

  if (!isAuthenticated) {
    return <PasswordGate slug={slug} />;
  }

  return <KitchenBoard slug={slug} />;
};

export default KitchenPage;
