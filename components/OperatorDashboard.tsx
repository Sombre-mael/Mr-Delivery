import Link from "next/link";
import { ArrowRight, Clock3, PackageCheck, PackageSearch, Truck } from "lucide-react";
import type { DeliveryOrder } from "@/lib/orders";
import { deliveryStatusLabels } from "@/lib/whatsapp";

export function OperatorDashboard({ orders }: { orders: DeliveryOrder[] }) {
  const activeOrders = orders.filter((order) => !order.archivedAt);
  const stats = [
    { label: "Actives", value: activeOrders.length, detail: "Commandes en cours", icon: PackageSearch, tone: "bg-ink text-white" },
    { label: "Paiement", value: activeOrders.filter((order) => order.status === "payment_pending").length, detail: "À confirmer", icon: Clock3, tone: "bg-gold text-ink" },
    { label: "En livraison", value: activeOrders.filter((order) => order.status === "in_delivery").length, detail: "Courses actives", icon: Truck, tone: "bg-ink text-gold" },
    { label: "Livrées", value: orders.filter((order) => order.status === "delivered").length, detail: "Total terminé", icon: PackageCheck, tone: "bg-green-100 text-green-800" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-gold">Vue d’ensemble</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Bonjour, voici l’activité du jour</h1>
          <p className="mt-2 text-sm text-neutral-600">Les éléments urgents restent visibles sans parcourir toute la console.</p>
        </div>
        <Link href="/operator/orders?new=1" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-black text-ink transition hover:bg-ink hover:text-white">
          Nouvelle commande <ArrowRight size={17} />
        </Link>
      </div>

      <section aria-label="Indicateurs" className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-lg border border-ink/8 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-black uppercase text-neutral-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-black">{stat.value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.tone}`}><Icon size={18} /></span>
              </div>
              <p className="mt-2 text-xs font-bold text-neutral-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-gold">Priorités</p>
            <h2 className="mt-1 text-xl font-black">Commandes récentes</h2>
          </div>
          <Link href="/operator/orders" className="text-sm font-black text-neutral-500 hover:text-ink">Voir toutes</Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-ink/8 bg-white">
          {activeOrders.slice(0, 6).length ? activeOrders.slice(0, 6).map((order) => (
            <Link key={order.id} href={`/operator/orders?order=${order.trackingCode}`} className="grid gap-2 border-b border-ink/8 px-4 py-4 transition last:border-0 hover:bg-gold/8 sm:grid-cols-[1.2fr_0.8fr_0.8fr_auto] sm:items-center">
              <div><p className="font-black">{order.customerName}</p><p className="mt-1 text-xs font-bold text-neutral-500">{order.trackingCode}</p></div>
              <p className="text-sm font-semibold text-neutral-600">{order.packName || "Sans pack"}</p>
              <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-black">{deliveryStatusLabels[order.status]}</span>
              <ArrowRight className="hidden text-neutral-400 sm:block" size={17} />
            </Link>
          )) : (
            <div className="p-6 text-sm text-neutral-600">Aucune commande active. La prochaine commande apparaîtra ici.</div>
          )}
        </div>
      </section>
    </div>
  );
}
