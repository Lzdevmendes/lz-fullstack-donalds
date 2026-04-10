import { ReactNode } from "react";

import { CartProvider } from "@/contexts/cart";

const SlugLayout = ({ children }: { children: ReactNode }) => {
  return <CartProvider>{children}</CartProvider>;
};

export default SlugLayout;
