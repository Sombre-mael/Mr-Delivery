import type { Metadata } from "next";
import { OperatorCatalogManager } from "@/components/OperatorCatalogManager";
import { OperatorShell } from "@/components/OperatorShell";
import { getCatalogData } from "@/lib/catalog";
import { requireOperatorIdentity } from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offres et réglages | Mr. Delivery",
  description: "Gestion interne des packs, services et coordonnées Mr. Delivery.",
  robots: { index: false, follow: false },
};

type CatalogPageProps = {
  searchParams?: Promise<{ error?: string; saved?: string; tab?: string }>;
};

export default async function OperatorCatalogPage({ searchParams }: CatalogPageProps) {
  const identity = await requireOperatorIdentity({ adminOnly: true });

  const [catalog, params] = await Promise.all([
    getCatalogData({ includeInactive: true, includeLogs: true }),
    searchParams,
  ]);

  const requestedTab = params?.tab;
  const activeTab = requestedTab === "services" || requestedTab === "settings" || requestedTab === "history" ? requestedTab : "packs";

  return (
    <OperatorShell identity={identity}>
      <OperatorCatalogManager catalog={catalog} activeTab={activeTab} errorMessage={params?.error} savedState={params?.saved} />
    </OperatorShell>
  );
}
