import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-4">
        <div>
          <a href="#" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gradient-primary)]">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            Passport<span className="text-gradient-primary">AI</span>
          </a>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Studio‑grade passport photos in your browser. Built in Bengaluru.
          </p>
        </div>
        {[
          { t: "Product", l: ["Features", "Pricing", "API", "Changelog"] },
          { t: "Countries", l: ["India", "USA · UK", "Schengen visa", "Aadhaar / PAN"] },
          { t: "Company", l: ["About", "Privacy", "Terms", "Contact"] },
        ].map((c) => (
          <div key={c.t}>
            <h4 className="font-display text-sm font-semibold">{c.t}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {c.l.map((i) => (
                <li key={i}><a href="#" className="hover:text-foreground transition-colors">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-6xl px-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} PassportAI. All rights reserved.
      </div>
    </footer>
  );
}
