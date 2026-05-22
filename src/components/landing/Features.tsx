import { motion } from "framer-motion";
import { Scan, Sparkles, Sun, Layers, Printer, Globe2, Wand2, Gauge } from "lucide-react";

const features = [
  { icon: Scan, title: "Smart face alignment", desc: "MediaPipe Face Mesh detects eyes, chin and shoulders, then auto‑rotates and crops to spec." },
  { icon: Globe2, title: "40+ country presets", desc: "India, USA, UK, Canada, Schengen visa, Aadhaar, PAN — official dimensions and DPI baked in." },
  { icon: Layers, title: "Hair‑perfect cutout", desc: "Edge‑refining segmentation preserves stray hair, glasses and earrings. No purple halo." },
  { icon: Sun, title: "Studio lighting AI", desc: "Softbox, beauty and ring‑light simulation rebalances harsh shadows and exposure." },
  { icon: Wand2, title: "Pro retouch sliders", desc: "Skin smoothing, teeth whitening, eye enhance, HDR portrait — all non‑destructive." },
  { icon: Sparkles, title: "Real‑ESRGAN upscale", desc: "2× and 4× upscale with GFPGAN face restore for tack‑sharp 600 DPI prints." },
  { icon: Printer, title: "Auto print sheets", desc: "4, 6, 8 or 9 copies on 4R / A4 / Letter with cut marks, bleed and DPI checker." },
  { icon: Gauge, title: "Renders in <3s", desc: "WebGL + Web Workers do the heavy lifting in the browser. Zero round‑trip lag." },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">The Studio</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Eight engines.<br /> <span className="text-gradient-primary">One perfect photo.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative rounded-2xl glass p-6 transition-all hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                   style={{ background: "radial-gradient(400px circle at 50% 0%, oklch(0.62 0.21 285 / 0.15), transparent 60%)" }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
