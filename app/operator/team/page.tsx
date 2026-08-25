import type { Metadata } from "next";
import { OperatorShell } from "@/components/OperatorShell";
import { OperatorTeamManager } from "@/components/OperatorTeamManager";
import { requireOperatorIdentity } from "@/lib/operator-auth";
import { listOperatorActivity, listOperatorMembers } from "@/lib/operator-members";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Équipe et accès | Mr. Delivery",
  description: "Gestion des membres autorisés dans l’espace Équipe.",
  robots: { index: false, follow: false },
};

type TeamPageProps = { searchParams?: Promise<{ error?: string; saved?: string }> };

export default async function OperatorTeamPage({ searchParams }: TeamPageProps) {
  const identity = await requireOperatorIdentity({ adminOnly: true });
  const [members, activity, params] = await Promise.all([listOperatorMembers(), listOperatorActivity(), searchParams]);

  return <OperatorShell identity={identity}><OperatorTeamManager identity={identity} members={members} activity={activity} errorMessage={params?.error} savedState={params?.saved} /></OperatorShell>;
}
