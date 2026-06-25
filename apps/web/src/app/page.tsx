import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      {/* rest of sections */}
      <Hero />
      <HowItWorks />

      
    </main>
  );
}