import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import passportAfter from "@/assets/hero-passport-after.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-28">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 -z-10 grid-bg" />
      <img
        src={heroBg}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25 mix-blend-screen"
      />
      <div className="glow-orb -z-10 h-[420px] w-[420px] -top-32 -left-20" style={{ background: "var(--indigo)" }} />
      <div className="glow-orb -z-10 h-[520px] w-[520px] -bottom-40 -right-20" style={{ background: "var(--violet)" }} />

      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-[var(--violet)]" />
              New · Real‑ESRGAN portrait upscaling
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="text-gradient">Studio‑grade</span>
              <br />
              passport photos.
              <br />
              <span className="text-gradient-primary">In one upload.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground"
            >
              AI detects your face, fixes lighting, removes the background, and prints a
              ready‑to‑cut 4R sheet — accepted in 40+ countries. No Photoshop. No studio fees.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a href="/studio" className="btn-hero">
                Create my passport photo <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#demo" className="btn-ghost-glow">
                <Play className="h-4 w-4" /> Watch 30‑sec demo
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-10 flex items-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--violet)]" /> 99.4% govt acceptance</div>
              <div className="hidden sm:block">·</div>
              <div>2.1M photos generated</div>
              <div className="hidden sm:block">·</div>
              <div>Trusted by 800+ studios</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-[var(--gradient-primary)] opacity-30 blur-2xl" />
            <div className="relative animate-float rounded-3xl glass p-3 shadow-[var(--shadow-elegant)]">
              <img
                src={passportAfter}
                alt="AI-enhanced passport photo result"
                width={768}
                height={1024}
                fetchPriority="high"
                decoding="async"
                className="rounded-2xl"
              />
              <div className="absolute -bottom-4 -left-4 rounded-2xl glass px-4 py-3 text-xs">
                <div className="text-muted-foreground">Detected face</div>
                <div className="font-mono text-[var(--violet)]">99.8% · aligned ✓</div>
              </div>
              <div className="absolute -top-4 -right-4 rounded-2xl glass px-4 py-3 text-xs">
                <div className="text-muted-foreground">DPI</div>
                <div className="font-mono text-[var(--accent)]">600 · print ready</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
