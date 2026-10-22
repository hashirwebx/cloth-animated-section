"use client";
import { useEffect, useRef } from "react";
import { useFrameSequence } from "@/hooks/useFrameSequence";
import { formatPrice, type Product } from "@/data/products";

type Props = {
  product: Product; index: number; active: boolean; dir: -1 | 0 | 1;
  reduced: boolean; coarse: boolean;
  onActivate: (i: number | null) => void; onOpen: (i: number) => void;
};

export function RackSlot({ product, index, active, dir, reduced, coarse, onActivate, onOpen }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { frames } = product;
  const { setTarget, redraw } = useFrameSequence(frames, ref, { reduced });

  useEffect(() => setTarget(active ? 1 : 0), [active, setTarget]);
  useEffect(redraw, [redraw]);

  return (
    <button
      type="button"
      aria-label={`${product.name}, ${formatPrice(product.price)}. Open details`}
      className="rack-slot group relative block shrink-0 snap-center outline-none"
      style={{ transform: `translateX(calc(${dir} * var(--shift)))` }}
      onPointerEnter={(e) => e.pointerType === "mouse" && onActivate(index)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onActivate(null)}
      onFocus={() => onActivate(index)}
      onBlur={() => onActivate(null)}
      onClick={() => (coarse && !active ? onActivate(index) : onOpen(index))}
    >
      {/* load-in runs on the canvas itself */}
      <canvas
        ref={ref}
        width={frames.width}
        height={frames.height}
        aria-hidden
        className="slide-in block h-auto w-full group-focus-visible:drop-shadow-[0_0_0_#c4501b]"
        style={{ aspectRatio: `${frames.width} / ${frames.height}`, animationDelay: `${index * 90}ms` }}
      />
    </button>
  );
}
