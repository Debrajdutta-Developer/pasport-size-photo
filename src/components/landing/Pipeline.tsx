import { motion } from "framer-motion";

const steps = [
  { n: "01", t: "Detect face", d: "MediaPipe locates 468 facial landmarks." },
  { n: "02", t: "Align & crop", d: "Auto‑rotates head, frames to country spec." },
  { n: "03", t: "Remove background", d: "Edge‑aware segmentation, hair preserved." },
  { n: "04", t: "Enhance portrait", d: "Lighting, skin, eye and tone correction." },
  { n: "05", t: "Upscale", d: "Real‑ESRGAN + GFPGAN for 600 DPI sharpness." },
  { n: "06", t: "Print layout", d: "Auto‑tiled 4R sheet with cut marks." },
];

export function Pipeline() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">Pipeline</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Six AI passes.<br /><span className="text-gradient-primary">Under three seconds.</span>
          </h2>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--violet)] to-transparent md:block" />
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className={`rounded-2xl glass p-6 ${i % 2 ? "md:mt-12" : ""}`}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-[var(--violet)]">{s.n}</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
