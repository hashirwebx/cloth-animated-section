import { ClothingRack } from "@/components/ClothingRack";
import { products } from "@/data/products";

// DEMO ONLY: repeats the single real piece so the rack has 5 slots. Delete when you have real pieces.
const rack = Array.from({ length: 5 }, (_, i) => ({ ...products[0], slug: `${products[0].slug}-demo-${i}` }));

const ticker = "Drop 01 — Ashfall · Hover a piece to turn it · Click to open · ";

export default function Page() {
  return (
    <main className="grid min-h-screen grid-rows-[auto_1fr_auto] pb-10">
      <header className="mono grid grid-cols-3 items-center px-6 py-5 text-xs tracking-[.2em] uppercase">
        <span>Drop 01</span>
        <h1 className="display text-center text-3xl tracking-[.04em] normal-case md:text-5xl">Tejarify</h1>
        <span className="text-right">{String(rack.length).padStart(2, "0")} pieces</span>
      </header>
      <div className="grid place-items-center pt-4 md:pt-10">
        <ClothingRack products={rack} />
      </div>
      <div className="ticker fixed inset-x-0 bottom-0" aria-hidden>
        <div className="ticker-track mono">{ticker.repeat(8)}</div>
      </div>
    </main>
  );
}
