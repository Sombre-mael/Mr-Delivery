import type { Metadata } from "next";
import type { ElementType } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Home,
  MessageCircle,
  PackageCheck,
  Truck,
} from "lucide-react";
import { getOrderByTrackingCode, getOrderEvents } from "@/lib/orders";
import {
  deliveryStatusLabels,
  generateTrackingSupportMessage,
  generateWhatsAppLink,
  type DeliveryStatus,
} from "@/lib/whatsapp";
import { maskCustomerName, maskLocation, normalizeTrackingCode } from "@/lib/order-utils";
import { PwaInstallGate } from "@/components/PwaInstallGate";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { TrackingExperience } from "@/components/TrackingExperience";

export const dynamic = "force-dynamic";

const timeline: Array<{ status: DeliveryStatus; title: string; description: string }> = [
  {
    status: "payment_pending",
    title: "Réservation",
    description: "La demande attend la confirmation du paiement.",
  },
  {
    status: "payment_confirmed",
    title: "Paiement confirmé",
    description: "La course est confirmée par Mr. Delivery.",
  },
  {
    status: "picked_up",
    title: "Colis récupéré",
    description: "Le colis a été pris en charge au ramassage.",
  },
  {
    status: "in_delivery",
    title: "En livraison",
    description: "Votre colis avance vers sa destination.",
  },
  {
    status: "delivered",
    title: "Livré",
    description: "Le colis est arrivé à destination.",
  },
];

const statusIcons: Record<DeliveryStatus, ElementType> = {
  payment_pending: Clock3,
  payment_confirmed: CheckCircle2,
  picked_up: PackageCheck,
  in_delivery: Truck,
  delivered: CheckCircle2,
  issue: AlertTriangle,
};

const statusDescriptions: Record<DeliveryStatus, string> = {
  payment_pending: "Votre réservation est bien reçue. Nous attendons la confirmation du paiement.",
  payment_confirmed: "Tout est confirmé. L'équipe prépare maintenant la prise en charge du colis.",
  picked_up: "Bonne nouvelle, votre colis est entre les mains de Mr. Delivery.",
  in_delivery: "Votre colis est en route. Vous serez averti dès son arrivée.",
  delivered: "Mission accomplie, votre colis est arrivé à destination.",
  issue: "Un point demande votre attention. L'équipe vous contactera pour le résoudre rapidement.",
};

type TrackingDetailPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: TrackingDetailPageProps): Promise<Metadata> {
  const { code } = await params;
  const displayCode = normalizeTrackingCode(code) || "Code de suivi";

  return {
    title: `Suivi ${displayCode} | Mr. Delivery`,
    description: "État de livraison Mr. Delivery.",
    robots: { index: false, follow: false },
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-CD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function TrackingDetailPage({ params }: TrackingDetailPageProps) {
  const { code } = await params;
  const normalizedCode = normalizeTrackingCode(code);
  const displayCode = normalizedCode || code.slice(0, 32).toUpperCase();
  const order = normalizedCode ? await getOrderByTrackingCode(normalizedCode) : null;

  if (!order) {
    const supportLink = generateWhatsAppLink(
      generateTrackingSupportMessage({ trackingCode: displayCode, statusLabel: "Code introuvable" }),
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
        <PwaInstallGate />
        <TrackingExperience status="issue">
          <section className="tracking-enter w-full max-w-lg rounded-2xl border border-ink/10 bg-white p-6 text-center shadow-soft sm:p-8">
            <span className="current-status-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
              <AlertTriangle size={34} />
            </span>
            <h1 className="mt-4 text-2xl font-black">Code introuvable</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Aucune commande ne correspond au code <strong>{displayCode}</strong>. Vérifiez-le ou demandez-nous de l'aide.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href="/track" className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink">
                Réessayer
              </a>
              <a href={supportLink} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white">
                <MessageCircle size={17} />
                Obtenir de l'aide
              </a>
            </div>
          </section>
        </TrackingExperience>
      </main>
    );
  }

  const events = await getOrderEvents(order.id);
  const directIndex = timeline.findIndex((item) => item.status === order.status);
  const eventIndex = events.reduce(
    (highest, event) => Math.max(highest, timeline.findIndex((item) => item.status === event.status)),
    0,
  );
  const progressIndex = directIndex >= 0 ? directIndex : eventIndex;
  const progressPercent = (progressIndex / (timeline.length - 1)) * 100;
  const StatusIcon = statusIcons[order.status];
  const supportLink = generateWhatsAppLink(
    generateTrackingSupportMessage({
      trackingCode: order.trackingCode,
      invoiceNumber: order.invoiceNumber,
      statusLabel: deliveryStatusLabels[order.status],
      pickup: maskLocation(order.pickup),
      destination: maskLocation(order.destination),
    }),
  );

  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-6 text-ink sm:px-6 sm:py-8 lg:px-8">
      <PwaInstallGate />
      <TrackingExperience status={order.status}>
        <section className="mx-auto max-w-5xl pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <header className="tracking-enter flex items-center justify-between gap-3 border-b border-ink/10 pb-4 sm:pb-6">
            <div className="flex min-w-0 items-center gap-3">
              <Image src="/logo-mr-delivery.jpeg" alt="Logo Mr. Delivery" width={54} height={54} className="h-11 w-11 shrink-0 rounded-xl object-cover sm:h-12 sm:w-12" />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-gold sm:text-sm">Suivi colis</p>
                <h1 className="truncate text-xl font-black sm:text-3xl">{order.trackingCode}</h1>
              </div>
            </div>
            <a href="/" aria-label="Retour à l'accueil" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white transition hover:border-gold hover:text-gold">
              <Home size={18} />
            </a>
          </header>

          <section className={`tracking-enter relative mt-5 overflow-hidden rounded-2xl bg-ink p-5 text-white shadow-soft sm:p-6 ${order.status === "delivered" ? "ring-2 ring-gold/45" : ""}`}>
            {order.status === "delivered" ? <span className="delivery-celebration absolute -right-7 -top-7 h-24 w-24 rounded-full border-[18px] border-gold/15" aria-hidden="true" /> : null}
            <div className="relative flex items-start gap-4">
              <span className="current-status-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                <StatusIcon size={28} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-gold">État actuel</p>
                <h2 className="mt-1 text-2xl font-black sm:text-3xl">{deliveryStatusLabels[order.status]}</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">{statusDescriptions[order.status]}</p>
                <p className="mt-3 text-xs font-bold text-white/50">Mis à jour le {formatDate(order.updatedAt)}</p>
              </div>
            </div>
            <a href={supportLink} target="_blank" rel="noreferrer" className="relative mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-white sm:w-auto">
              <MessageCircle size={17} />
              Contacter Mr. Delivery
            </a>
          </section>

          <PushNotificationManager trackingCode={order.trackingCode} />

          <section className="tracking-enter mt-5 rounded-2xl border border-ink/8 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-gold">Votre trajet</p>
                <h2 className="mt-1 text-xl font-black">Progression de la livraison</h2>
              </div>
              <span className="text-sm font-black text-neutral-500">{progressIndex + 1}/{timeline.length}</span>
            </div>

            <div className="relative mt-6 space-y-3 md:grid md:grid-cols-5 md:gap-3 md:space-y-0">
              <span className="absolute bottom-5 left-[1.22rem] top-5 w-0.5 bg-ink/8 md:hidden" aria-hidden="true">
                <span className="tracking-progress-line block w-full origin-top bg-gold" style={{ height: `${progressPercent}%` }} />
              </span>
              {timeline.map((item, index) => {
                const isDone = progressIndex >= index || order.status === "delivered";
                const isCurrent = order.status === item.status;
                const Icon = statusIcons[item.status];

                return (
                  <article
                    key={item.status}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`tracking-step relative flex gap-3 rounded-xl border p-3 md:block md:p-4 ${
                      isCurrent
                        ? "border-gold bg-gold/12 shadow-gold"
                        : isDone
                          ? "border-ink/10 bg-[#fffdf7]"
                          : "border-ink/8 bg-white text-neutral-500"
                    }`}
                  >
                    <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-ink text-gold" : "bg-neutral-100 text-neutral-400"}`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black md:mt-4">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 md:mt-2">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <details open className="group tracking-enter mt-5 rounded-2xl border border-ink/8 bg-white shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Informations</p>
                <h2 className="mt-1 text-xl font-black">Détails de la livraison</h2>
              </div>
              <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={21} />
            </summary>
            <div className="grid gap-4 border-t border-ink/8 px-5 pb-5 pt-4 text-sm sm:grid-cols-2 sm:px-6 sm:pb-6">
              {[
                ["Client", order.customerName ? maskCustomerName(order.customerName) : "À confirmer"],
                ["Facture", order.invoiceNumber],
                ["Pack", order.packName || "À confirmer"],
                ["Service", order.service || "À confirmer"],
                ["Type de colis", order.packageType || "À confirmer"],
                ["Urgence", order.urgency || "À confirmer"],
                ["Paiement", order.paymentStatus || "À confirmer"],
                ["Ramassage", maskLocation(order.pickup)],
                ["Livraison", maskLocation(order.destination)],
              ].map(([label, value]) => (
                <p key={label}>
                  <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{label}</span>
                  <span className="mt-1 block font-bold">{value}</span>
                </p>
              ))}
            </div>
          </details>

          {events.length ? (
            <details className="group tracking-enter mt-5 rounded-2xl border border-ink/8 bg-white shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">{events.length} mise{events.length > 1 ? "s" : ""} à jour</p>
                  <h2 className="mt-1 text-xl font-black">Historique</h2>
                </div>
                <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={21} />
              </summary>
              <div className="space-y-3 border-t border-ink/8 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                {events.map((event) => (
                  <div key={event.id} className="flex gap-3 rounded-xl bg-[#fffdf7] p-4 text-sm">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
                    <div>
                      <p className="font-black">{deliveryStatusLabels[event.status]}</p>
                      <p className="mt-1 text-xs text-neutral-500">{formatDate(event.createdAt)}</p>
                      {event.publicNote ? <p className="mt-2 leading-6 text-neutral-600">{event.publicNote}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      </TrackingExperience>
    </main>
  );
}
