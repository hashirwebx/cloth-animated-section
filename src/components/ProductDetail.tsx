"use client";
import { useEffect, useRef } from "react";
import { formatPrice, type Product } from "@/data/products";

type Props = { products: Product[]; index: number; onChange: (i: number) => void; onClose: () => void };

export function ProductDetail({ products, index, onChange, onClose }: Props) {
  const p = products[index];
  const n = products.length;
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = (d: number) => onChange((index + d + n) % n);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const cta = p.checkoutUrl
    ? <a href={p.checkoutUrl} className="cta">Buy — {formatPrice(p.price)}</a>
    : <button type="button" className="cta">See availability</button>;

  return (
    <div role="dialog" aria-modal="true" aria-label={p.name} className="detail-backdrop fixed inset-0 z-50 grid place-items-center">
      <button ref={closeRef} onClick={onClose} className="mono absolute right-5 top-5 z-10 px-2 py-1 text-xs tracking-[.2em] uppercase">Close ✕</button>
      <span className="mono absolute left-5 top-5 text-xs tracking-[.2em]">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
      <div className="flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 md:flex-row md:gap-12">
        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          {n > 1 && <button aria-label="Previous piece" onClick={() => go(-1)} className="arrow left-0">←</button>}
          {/* key restarts the swing-in on every piece */}
          <img key={p.slug} src={p.front} alt={`${p.name}, front view`} className="swing-in max-h-[62vh] w-auto object-contain md:max-h-[82vh]" />
          {n > 1 && <button aria-label="Next piece" onClick={() => go(1)} className="arrow right-0">→</button>}
        </div>
        <div className="w-full max-w-sm shrink-0 pb-6 md:pb-0">
          <p className="mono text-xs tracking-[.2em] uppercase opacity-60">Drop 01</p>
          <h2 className="display mt-2 text-4xl leading-none md:text-5xl">{p.name}</h2>
          <p className="mt-4 text-sm leading-relaxed opacity-80">{p.description}</p>
          <div className="mt-5 flex gap-2" role="group" aria-label="Sizes">
            {p.variants.map((v) => (
              <span key={v.label} className={`mono grid size-9 place-items-center border text-xs ${v.inStock ? "" : "line-through opacity-40"}`}>{v.label}</span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-5">
            {cta}
            <span className="mono text-sm">{formatPrice(p.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
