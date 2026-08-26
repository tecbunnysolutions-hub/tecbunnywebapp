import type { Metadata } from "next";

import CartPage from "@/components/cart/CartPage";

export const metadata: Metadata = {
  title: "Cart | TecBunny",
  description: "Review your selected items and proceed to checkout, or request a formal quote for bulk orders.",
};

export default function Page() {
  return <CartPage />;
}
