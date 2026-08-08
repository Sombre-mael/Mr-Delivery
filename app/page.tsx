import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MobileActionBar } from "@/components/MobileActionBar";
import { OrderComposer } from "@/components/OrderComposer";
import { Packs } from "@/components/Packs";
import { Regulations } from "@/components/Regulations";
import { Reviews } from "@/components/Reviews";
import { Services } from "@/components/Services";
import { TrackingSection } from "@/components/TrackingSection";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf7] pb-20 text-ink sm:pb-0">
      <LoadingScreen />
      <Header />
      <Hero />
      <OrderComposer />
      <TrackingSection />
      <Packs />
      <Services />
      <HowItWorks />
      <Regulations />
      <Reviews />
      <CallToAction />
      <Footer />
      <WhatsAppButton />
      <MobileActionBar />
    </main>
  );
}
