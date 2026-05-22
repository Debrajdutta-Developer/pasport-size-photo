import { motion } from "framer-motion";

const quotes = [
  { q: "Replaced our ₹200 passport machine. Customers walk out in two minutes flat.", a: "Ravi Sharma", r: "Owner · Sharma Studio, Jaipur" },
  { q: "Used it for my Schengen visa. Approved first try. The hair edges are insane.", a: "Aisha Khan", r: "Designer · Bengaluru" },
  { q: "We white‑labelled the API for our HR onboarding. 12,000 photos last month.", a: "Marc Ellis", r: "Head of Ops · NorthBeam" },
];

export function Testimonials() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">Loved by</p>
          <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Studios, students, travellers.</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {quotes.map((t, i) => (
            <motion.figure
              key={t.a}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl glass p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <blockquote className="font-display text-lg leading-snug">"{t.q}"</blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-medium">{t.a}</div>
                <div className="text-muted-foreground">{t.r}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
