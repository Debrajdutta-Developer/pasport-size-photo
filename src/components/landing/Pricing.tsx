import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const features = [
  "Unlimited passport photos",
  "All 40+ country presets",
  "AI face detection & alignment",
  "AI background removal",
  "Studio lighting & retouch",
  "Print sheets · 4R / A4 / Letter",
  "PNG · JPG · PDF export",
  "600 DPI print quality",
  "No watermark · no account",
  "Processed in your browser — 100% private",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">Pricing</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
            <span className="text-gradient-primary">Completely free.</span>
            <br />Forever.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No account, no card, no watermark. The entire studio runs in your browser.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto mt-14 max-w-xl rounded-3xl p-10"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.25 0.12 285 / 0.6), oklch(0.18 0.08 290 / 0.4))",
            border: "1px solid oklch(0.72 0.18 305 / 0.4)",
            boxShadow: "var(--shadow-glow), var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Everything. Included.</h3>
              <p className="text-xs text-muted-foreground">No tiers. No upsell.</p>
            </div>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-6xl font-semibold">₹0</span>
            <span className="text-sm text-muted-foreground">forever</span>
          </div>

          <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--violet)]" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <a href="/studio" className="btn-hero mt-10 w-full">
            Open the Studio
          </a>
        </motion.div>
      </div>
    </section>
  );
}
