import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Nav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-x-0 top-4 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-full glass px-5 py-3"
    >
      <a href="#" className="flex items-center gap-2 font-display text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4 w-4 text-white" />
        </span>
        <span>Passport<span className="text-gradient-primary">AI</span></span>
      </a>
      <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
      </nav>
      <a href="/studio" className="btn-hero text-sm" style={{ padding: "0.5rem 1.1rem" }}>
        Open Studio
      </a>
    </motion.header>
  );
}
