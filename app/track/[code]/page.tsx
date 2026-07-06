import type { Metadata } from "next";
import type { ElementType } from "react";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Clock3, Home, MessageCircle, PackageCheck, Truck } from "lucide-react";
import { getOrderByTrackingCode, getOrderEvents } from "@/lib/orders";
import {
  deliveryStatusLabels,
  generateTrackingSupportMessage,
  generateWhatsAppLink,
  type DeliveryStatus,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const timeline: Array<{ status: DeliveryStatus; title: string; description: string }> = [
  {
    status: "payment_pending",
    title: "Reservation",
    description: "La demande est creee et attend la confirmation du paiement.",
  },
  {
    status: "payment_confirmed",
    title: "Paiement confirme",
    description: "La course est confirmee par l'equipe Mr. Delivery.",
  },
  {
    status: "picked_up",
    title: "Colis recupere",
    description: "Le colis a ete pris en charge au lieu de ramassage.",
  },
  {
    status: "in_delivery",
    title: "En livraison",
    description: "Le livreur est en route vers la destination.",
  },
  {
    status: "delivered",
    title: "Livre",
    description: "Le colis est arrive a destination.",
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

type TrackingDetailPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: TrackingDetailPageProps): Promise<Metadata> {
  const { code } = await params;

  return {
    title: `Suivi ${code.toUpperCase()} | Mr. Delivery`,
    description: "Etat de livraison Mr. Delivery.",
    robots: {
      index: false,
      follow: false,
    },
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
  const order = await getOrderByTrackingCode(code);

  if (!order) {
    const supportLink = generateWhatsAppLink(
      generateTrackingSupportMessage({
        trackingCode: code.toUpperCase(),
        statusLabel: "Code introuvable",
      }),
    );

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
        <section className="w-full max-w-lg rounded-2xl border border-ink/10 bg-white p-6 text-center shadow-soft sm:p-8">
          <AlertTriangle className="mx-auto text-gold" size={42} />
          <h1 className="mt-4 text-2xl font-black">Code introuvable</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Nous n'avons trouve aucune commande avec le code {code.toUpperCase()}. Verifiez le code ou contactez Mr. Delivery.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/track"
              className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink"
            >
              Reessayer
            </a>
            <a
              href={supportLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white"
            >
              <MessageCircle size={17} />
              Contacter Mr. Delivery
            </a>
          </div>
        </section>
      </main>
    );
  }

  const events = await getOrderEvents(order.id);
  const activeIndex = timeline.findIndex((item) => item.status === order.status);
  const StatusIcon = statusIcons[order.status];
  const supportLink = generateWhatsAppLink(
    generateTrackingSupportMessage({
      trackingCode: order.trackingCode,
      invoiceNumber: order.invoiceNumber,
      statusLabel: deliveryStatusLabels[order.status],
      pickup: order.pickup,
      destination: order.destination,
    }),
  );

  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-mr-delivery.jpeg"
              alt="Logo Mr. Delivery"
              width={54}
              height={54}
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Suivi colis</p>
              <h1 className="text-2xl font-black sm:text-3xl">{order.trackingCode}</h1>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={supportLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white"
            >
              <MessageCircle size={16} />
              Contacter Mr. Delivery
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 px-5 py-3 text-sm font-black transition hover:border-gold"
            >
              <Home size={16} />
              Site principal
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-ink/8 bg-ink p-5 text-white shadow-soft sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                <StatusIcon size={28} />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Etat actuel</p>
                <h2 className="mt-2 text-3xl font-black">{deliveryStatusLabels[order.status]}</h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Derniere mise a jour: {formatDate(order.updatedAt)}
                </p>
              </div>
            </div>

            {order.status === "issue" ? (
              <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-white/80">
                Une information importante concerne cette course. L'equipe Mr. Delivery vous contactera pour clarifier.
              </div>
            ) : null}

            <a
              href={supportLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-white"
            >
              <MessageCircle size={17} />
              Demander une mise a jour
            </a>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="text-xl font-black">Details de la livraison</h2>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Client</span>
                <span className="mt-1 block font-bold">{order.customerName || "A confirmer"}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Facture</span>
                <span className="mt-1 block font-bold">{order.invoiceNumber}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Pack</span>
                <span className="mt-1 block font-bold">{order.packName || "A confirmer"}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Service</span>
                <span className="mt-1 block font-bold">{order.service || "A confirmer"}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Type de colis</span>
                <span className="mt-1 block font-bold">{order.packageType || "A confirmer"}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Urgence</span>
                <span className="mt-1 block font-bold">{order.urgency || "A confirmer"}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Paiement</span>
                <span className="mt-1 block font-bold">{order.paymentStatus || "A confirmer"}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Ramassage</span>
                <span className="mt-1 block font-bold">{order.pickup || "A confirmer"}</span>
              </p>
              <p>
                <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Livraison</span>
                <span className="mt-1 block font-bold">{order.destination || "A confirmer"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-ink/8 bg-white p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-black">Progression</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {timeline.map((item, index) => {
              const isDone = activeIndex >= index || order.status === "delivered";
              const isCurrent = order.status === item.status;
              const Icon = statusIcons[item.status];

              return (
                <div
                  key={item.status}
                  className={`rounded-xl border p-4 ${
                    isCurrent
                      ? "border-gold bg-gold/12"
                      : isDone
                        ? "border-ink/10 bg-[#fffdf7]"
                        : "border-ink/8 bg-white text-neutral-500"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isDone ? "bg-ink text-gold" : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 text-sm font-black">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {events.length ? (
          <div className="mt-6 rounded-2xl border border-ink/8 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="text-xl font-black">Historique</h2>
            <div className="mt-5 space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl bg-[#fffdf7] p-4 text-sm">
                  <p className="font-black">{deliveryStatusLabels[event.status]}</p>
                  <p className="mt-1 text-neutral-600">{formatDate(event.createdAt)}</p>
                  {event.note ? <p className="mt-2 leading-6 text-neutral-600">{event.note}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
