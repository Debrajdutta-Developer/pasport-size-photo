import { useRef, useState } from "react";
import { motion } from "framer-motion";
import before from "@/assets/hero-passport-before.jpg";
import after from "@/assets/hero-passport-after.jpg";

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const updateFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <section id="demo" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">Before / After</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
            From <span className="text-gradient-primary">selfie</span> to studio.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Drag the slider. Real output, no filters — just our face detection, background removal,
            lighting model and Real‑ESRGAN upscaler running end to end.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto mt-14 max-w-3xl"
        >
          <div className="absolute -inset-8 rounded-[2.5rem] bg-[var(--gradient-primary)] opacity-20 blur-3xl" />
          <div
            ref={ref}
            onMouseMove={(e) => e.buttons === 1 && updateFromClientX(e.clientX)}
            onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
            onClick={(e) => updateFromClientX(e.clientX)}
            className="relative aspect-square select-none overflow-hidden rounded-3xl glass shadow-[var(--shadow-elegant)]"
          >
            <img src={after} alt="After" className="absolute inset-0 h-full w-full object-cover" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <img src={before} alt="Before" className="h-full w-full object-cover" />
            </div>
            <div
              className="absolute inset-y-0 w-0.5 bg-white/80 shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              style={{ left: `${pos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="grid h-12 w-12 cursor-ew-resize place-items-center rounded-full bg-white text-black shadow-2xl">
                  <span className="text-xs font-bold">⇆</span>
                </div>
              </div>
            </div>
            <span className="absolute left-4 top-4 rounded-full glass px-3 py-1 font-mono text-xs">BEFORE</span>
            <span className="absolute right-4 top-4 rounded-full bg-[var(--gradient-primary)] px-3 py-1 font-mono text-xs text-white">AFTER</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Compare before and after"
            className="mt-6 w-full accent-[var(--primary)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
