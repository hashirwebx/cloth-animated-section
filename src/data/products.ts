import manifest from "./manifest.json";

export type FrameMeta = { dir: string; count: number; width: number; height: number };
export type Product = {
  slug: string;
  name: string;
  price: number;
  description: string;
  frames: FrameMeta;
  front: string; // transparent PNG for the detail view
  variants: { label: string; inStock: boolean }[];
  checkoutUrl?: string; // Stripe payment link / Shopify checkout permalink
};

export const products: Product[] = [
  {
    slug: "ashfall-crewneck",
    name: "Ashfall Crewneck",
    price: 110,
    description:
      "Heavyweight washed-charcoal crewneck with bone ribbed collar and cuffs. Burnt-orange crack line runs down both sleeves and the side seams; one four-point star on the chest.",
    frames: manifest["ashfall-crewneck"],
    front: "/products/ashfall-crewneck-front.png",
    variants: ["S", "M", "L", "XL"].map((label) => ({ label, inStock: true })),
    checkoutUrl: undefined,
  },
];

export const formatPrice = (n: number) => `$${n}`;
