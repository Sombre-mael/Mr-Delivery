import type { Metadata } from "next";
import { headers } from "next/headers";
import { OperatorConsole } from "@/components/OperatorConsole";
import { OperatorShell } from "@/components/OperatorShell";
import { getCatalogData } from "@/lib/catalog";
import { requireOperatorIdentity } from "@/lib/operator-auth";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commandes | Mr. Delivery",
  description: "Gestion des commandes, relances et factures QR.",
  robots: { index: false, follow: false },
};

type OrdersPageProps = {
  searchParams?: Promise<{ order?: string; error?: string; saved?: string; new?: string }>;
};

async function getAppUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  return host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default async function OperatorOrdersPage({ searchParams }: OrdersPageProps) {
  const identity = await requireOperatorIdentity();

  const params = await searchParams;
  const [orders, catalog, appUrl] = await Promise.all([
    listOrders(),
    getCatalogData({ includeInactive: true }),
    getAppUrl(),
  ]);

  return (
    <OperatorShell identity={identity}>
      <OperatorConsole
        orders={orders}
        packs={catalog.packs}
        services={catalog.services}
        selectedTrackingCode={params?.new === "1" ? "" : params?.order}
        startWithNewOrder={params?.new === "1"}
        appUrl={appUrl}
        errorMessage={params?.error}
        savedState={params?.saved}
      />
    </OperatorShell>
  );
}
