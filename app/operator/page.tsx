import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OperatorConsole } from "@/components/OperatorConsole";
import { isOperatorAuthenticated } from "@/lib/operator-auth";
import { listOrders } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Console operateur | Mr. Delivery",
  description: "Outil interne Mr. Delivery pour relances WhatsApp et factures QR.",
  robots: {
    index: false,
    follow: false,
  },
};

type OperatorPageProps = {
  searchParams?: Promise<{ order?: string }>;
};

export default async function OperatorPage({ searchParams }: OperatorPageProps) {
  if (!(await isOperatorAuthenticated())) {
    redirect("/operator/login");
  }

  const params = await searchParams;
  const orders = await listOrders();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return <OperatorConsole orders={orders} selectedTrackingCode={params?.order} appUrl={appUrl} />;
}
