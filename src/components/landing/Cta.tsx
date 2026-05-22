import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] p-12 text-center md:p-20"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.25 0.15 280), oklch(0.32 0.18 305))",
            boxShadow: "var(--shadow-elegant)",
          }}
        >
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="glow-orb -top-20 -left-20 h-80 w-80" style={{ background: "white" }} />
          <div className="relative">
            <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Your perfect passport photo<br />is one upload away.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-white/70">
              100% free. Runs in your browser. No software, no studio, no Photoshop.
            </p>
            <a href="/studio" className="btn-hero mt-8">
              Get started for free <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
