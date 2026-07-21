import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ServiceCarousel } from "@/components/sections/CarouselPage";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PricingCards } from "@/components/sections/pricing-cards";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <Navbar />
      <Hero />
      <HowItWorks />
      <PricingCards />
      <ServiceCarousel />
      <Footer />
    </main>
  );
}