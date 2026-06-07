import { ReactNode } from "react";

import { CartProvider } from "@/contexts/cart";
import { db } from "@/lib/prisma";

interface SlugLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

const SlugLayout = async ({ children, params }: SlugLayoutProps) => {
  const { slug } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { primaryColor: true },
  });

  const primaryColor = restaurant?.primaryColor ?? "42 100% 50%";

  return (
    <div style={{ "--primary": primaryColor } as React.CSSProperties}>
      <CartProvider slug={slug}>{children}</CartProvider>
    </div>
  );
};

export default SlugLayout;
