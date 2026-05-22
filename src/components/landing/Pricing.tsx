import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    sub: "Try it now",
    features: ["1 photo / day", "Standard quality export", "Basic background removal", "Watermark on print sheet"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "₹299",
    sub: "per month",
    featured: true,
    features: ["Unlimited photos", "Ultra HD 600 DPI export", "All country presets", "AI retouch & lighting", "Print sheets · 4R / A4", "No watermark"],
    cta: "Go Pro",
  },
  {
    name: "Studio",
    price: "₹1,499",
    sub: "for photo studios",
    features: ["Everything in Pro", "Batch process 100+", "Team seats", "API access", "White‑label exports", "Priority queue"],
    cta: "Talk to sales",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">Pricing</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Cheaper than one studio visit.
          </h2>
          <p className="mt-4 text-muted-foreground">Cancel anytime. Pay with UPI, card or Razorpay.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 ${p.featured ? "" : "glass"}`}
              style={
                p.featured
                  ? {
                      background:
                        "linear-gradient(180deg, oklch(0.25 0.12 285 / 0.6), oklch(0.18 0.08 290 / 0.4))",
                      border: "1px solid oklch(0.72 0.18 305 / 0.4)",
                      boxShadow: "var(--shadow-glow), var(--shadow-card)",
                    }
                  : { boxShadow: "var(--shadow-card)" }
              }
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gradient-primary)] px-3 py-1 text-xs font-medium text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-medium text-muted-foreground">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.sub}</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--violet)]" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-8 block w-full text-center ${p.featured ? "btn-hero" : "btn-ghost-glow"}`}
              >
                {p.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
