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
import { getCatalogData } from "@/lib/catalog";

export const revalidate = 300;

export default async function Home() {
  const catalog = await getCatalogData();

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdf7] pb-20 text-ink sm:pb-0">
      <LoadingScreen />
      <Header settings={catalog.settings} />
      <Hero />
      <OrderComposer packs={catalog.packs} services={catalog.services} whatsappNumber={catalog.settings.whatsappNumber} />
      <TrackingSection />
      <Packs packs={catalog.packs} whatsappNumber={catalog.settings.whatsappNumber} />
      <Services services={catalog.services} />
      <HowItWorks />
      <Regulations />
      <Reviews whatsappNumber={catalog.settings.whatsappNumber} />
      <CallToAction settings={catalog.settings} />
      <Footer packs={catalog.packs} services={catalog.services} settings={catalog.settings} />
      <WhatsAppButton whatsappNumber={catalog.settings.whatsappNumber} />
      <MobileActionBar whatsappNumber={catalog.settings.whatsappNumber} />
    </main>
  );
}
