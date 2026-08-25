import type { Metadata } from "next";
import { OperatorDashboard } from "@/components/OperatorDashboard";
import { OperatorShell } from "@/components/OperatorShell";
import { requireOperatorIdentity } from "@/lib/operator-auth";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu équipe | Mr. Delivery",
  description: "Tableau de bord interne Mr. Delivery.",
  robots: { index: false, follow: false },
};

type OperatorPageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

export default async function OperatorPage({ searchParams }: OperatorPageProps) {
  const identity = await requireOperatorIdentity();
  const params = await searchParams;

  try {
    const orders = await listOrders();
    return (
      <OperatorShell identity={identity}>
        {params?.saved === "password" ? <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-800">Ton mot de passe personnel est enregistré. Ton compte est maintenant prêt.</p> : null}
        <OperatorDashboard orders={orders} />
      </OperatorShell>
    );
  } catch (error) {
    console.error("Operator dashboard unavailable", error);
    return (
      <OperatorShell identity={identity}>
        <section className="rounded-lg border border-red-200 bg-white p-6">
          <p className="text-xs font-black uppercase text-red-600">Service temporairement indisponible</p>
          <h1 className="mt-2 text-2xl font-black">Les commandes n’ont pas pu être chargées</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">Le service de commandes ne répond pas pour le moment. Réessaie dans quelques instants.</p>
        </section>
      </OperatorShell>
    );
  }
}
