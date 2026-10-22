"use client";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { FrameMeta } from "@/data/products";

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Hover progress p (0..1) -> frame index. Re-targeting mid-turn never jumps. */
export function useFrameSequence(
  meta: FrameMeta,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { duration = 1.1, reduced = false }: { duration?: number; reduced?: boolean } = {},
) {
  const bmps = useRef<(ImageBitmap | null)[]>([]);
  const s = useRef({ p: reduced ? 1 : 0, target: reduced ? 1 : 0, raf: 0, last: 0 });

  const draw = useCallback(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const n = meta.count;
    const idx = Math.round(ease(s.current.p) * (n - 1));
    let bmp = bmps.current[idx] ?? null;
    // not decoded yet: fall back to the nearest decoded frame, never draw nothing
    for (let d = 1; !bmp && d < n; d++) bmp = bmps.current[idx - d] ?? bmps.current[idx + d] ?? null;
    if (bmp) {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
    }
  }, [meta.count, canvasRef]);

  useEffect(() => {
    let dead = false;
    const n = meta.count;
    const src = (i: number) => `${meta.dir}/${String(i + 1).padStart(3, "0")}.webp`;
    const load = async (i: number) => {
      if (dead || bmps.current[i]) return;
      try {
        const blob = await (await fetch(src(i))).blob();
        const bmp = await createImageBitmap(blob);
        if (dead) return bmp.close();
        bmps.current[i] = bmp;
        draw(); // a late frame may be the one currently needed
      } catch {}
    };
    const order = [0, n - 1, ...Array.from({ length: n - 2 }, (_, k) => k + 1)];
    (async () => {
      await Promise.all(order.slice(0, 2).map(load)); // first + last: never block LCP on the rest
      const idle = (cb: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(cb) : setTimeout(cb, 200));
      idle(() => order.slice(2).forEach(load));
    })();
    return () => {
      dead = true;
      cancelAnimationFrame(s.current.raf);
      bmps.current.forEach((b) => b?.close());
      bmps.current = [];
    };
  }, [meta, draw]);

  const tick = useCallback(
    (t: number) => {
      const st = s.current;
      const dt = st.last ? Math.min((t - st.last) / 1000, 0.05) : 0;
      st.last = t;
      const step = dt / duration;
      st.p = st.target > st.p ? Math.min(st.p + step, st.target) : Math.max(st.p - step, st.target);
      draw();
      if (st.p !== st.target) st.raf = requestAnimationFrame(tick);
      else st.last = 0;
    },
    [draw, duration],
  );

  const setTarget = useCallback(
    (t: 0 | 1) => {
      if (reduced) return;
      const st = s.current;
      st.target = t;
      st.last = 0;
      cancelAnimationFrame(st.raf);
      st.raf = requestAnimationFrame(tick);
    },
    [tick, reduced],
  );

  return { setTarget, redraw: draw };
}
