import { ServiceCarousel } from "@/components/sections/CarouselPage";
import { Hero } from "@/components/sections/hero";
import { HowItWorksCTA } from "@/components/sections/HowItWorksCTA";
import { WhyLifyGo } from "@/components/sections/why-lifygo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <Hero />
      <HowItWorksCTA />
      <WhyLifyGo />
      <ServiceCarousel />
    </main>
  );
}