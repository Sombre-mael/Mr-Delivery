import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LoadingScreen } from "@/components/LoadingScreen";
import { OrderComposer } from "@/components/OrderComposer";
import { Packs } from "@/components/Packs";
import { Regulations } from "@/components/Regulations";
import { Reviews } from "@/components/Reviews";
import { Services } from "@/components/Services";
import { TrackingSection } from "@/components/TrackingSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf7] text-ink">
      <LoadingScreen />
      <Header />
      <Hero />
      <Services />
      <Packs />
      <OrderComposer />
      <TrackingSection />
      <HowItWorks />
      <Regulations />
      <Reviews />
      <CallToAction />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
