import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  { q: "Are these accepted by passport offices?", a: "Yes. Each preset matches the official spec for that country — dimensions, head ratio, background and 600 DPI print quality. 99.4% acceptance across 2M+ photos." },
  { q: "Do I need any software or plugins?", a: "No. Everything runs in your browser using WebGL and Web Workers. Works on iPhone, Android and desktop." },
  { q: "Is my photo private?", a: "Photos are processed in your browser and deleted from our servers within 1 hour. We never sell or train on your data." },
  { q: "Can I print at a local shop?", a: "Yes — download the 4R or A4 sheet with cut marks and hand it to any photo lab. Or export a single HD PNG / JPG / PDF." },
  { q: "Does it work for kids and babies?", a: "Yes. The face detector is tuned for all ages and the soft retouch is disabled automatically under 12." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">FAQ</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Questions, answered.</h2>
        </div>
        <div className="mt-12 divide-y divide-border rounded-3xl glass">
          {faqs.map((f, i) => (
            <div key={f.q} className="px-6">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="font-display text-lg font-medium">{f.q}</span>
                <Plus className={`h-5 w-5 transition-transform ${open === i ? "rotate-45 text-[var(--violet)]" : "text-muted-foreground"}`} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-8 text-muted-foreground">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
