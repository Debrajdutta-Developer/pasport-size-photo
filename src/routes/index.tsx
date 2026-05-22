import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { Features } from "@/components/landing/Features";
import { Pipeline } from "@/components/landing/Pipeline";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Faq } from "@/components/landing/Faq";
import { Cta } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PassportAI — Studio-grade passport photos in one upload" },
      { name: "description", content: "AI-powered passport photo studio. Face detection, background removal, studio lighting and print-ready 4R sheets. 40+ country presets." },
      { property: "og:title", content: "PassportAI — Studio-grade passport photos" },
      { property: "og:description", content: "From selfie to studio in under 3 seconds. 99.4% government acceptance across 40+ countries." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <Nav />
      <main>
        <Hero />
        <BeforeAfter />
        <Features />
        <Pipeline />
        <Pricing />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
