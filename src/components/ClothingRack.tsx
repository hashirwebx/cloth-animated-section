"use client";
import { useEffect, useState } from "react";
import { RackSlot } from "./RackSlot";
import { ProductDetail } from "./ProductDetail";
import { formatPrice, type Product } from "@/data/products";

export function ClothingRack({ products }: { products: Product[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const r = matchMedia("(prefers-reduced-motion: reduce)");
    const c = matchMedia("(hover: none)");
    const u = () => { setReduced(r.matches); setCoarse(c.matches); };
    u();
    r.addEventListener("change", u); c.addEventListener("change", u);
    return () => { r.removeEventListener("change", u); c.removeEventListener("change", u); };
  }, []);

  const shown = active !== null ? products[active] : null;

  return (
    <section aria-label="Collection" className="mx-auto w-full max-w-[1400px] px-4">
      <div className="rack relative" style={{ ["--shift" as string]: "clamp(6px, 2.6vw, 44px)" }}>
        <div className="rail" aria-hidden />
        <div
          className="rack-row relative z-[1] flex snap-x snap-mandatory items-start overflow-x-auto md:justify-center md:overflow-visible"
          style={{ transition: "none" }}
        >
          {products.map((p, i) => (
            <RackSlot
              key={p.slug}
              product={p}
              index={i}
              active={active === i}
              dir={active === null || active === i ? 0 : i < active ? -1 : 1}
              reduced={reduced}
              coarse={coarse}
              onActivate={setActive}
              onOpen={setOpen}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex h-24 flex-col items-center gap-3 text-center" aria-live="polite">
        <p className="mono text-xs tracking-[.18em] uppercase">
          {shown ? `${shown.name} — ${formatPrice(shown.price)}` : coarse ? "Tap a piece to turn it" : "Hover a piece"}
        </p>
        <button
          type="button"
          tabIndex={shown ? 0 : -1}
          onClick={() => active !== null && setOpen(active)}
          className={`cta transition-opacity duration-300 ${shown ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          See availability
        </button>
      </div>

      {open !== null && <ProductDetail products={products} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
