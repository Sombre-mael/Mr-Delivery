"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Boxes,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Settings2,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/operator/actions";
import type { OperatorIdentity } from "@/lib/operator-auth";

const navigation = [
  { label: "Aperçu", href: "/operator", icon: LayoutDashboard, match: "dashboard" },
  { label: "Commandes", href: "/operator/orders", icon: PackageSearch, match: "orders" },
  { label: "Offres", href: "/operator/catalog?tab=packs", icon: Boxes, match: "catalog" },
  { label: "Réglages", href: "/operator/catalog?tab=settings", icon: Settings2, match: "settings" },
  { label: "Équipe", href: "/operator/team", icon: Users, match: "team" },
] as const;

function isActive(pathname: string, tab: string | null, match: (typeof navigation)[number]["match"]) {
  if (match === "dashboard") return pathname === "/operator";
  if (match === "catalog") return pathname === "/operator/catalog" && tab !== "settings";
  if (match === "settings") return pathname === "/operator/catalog" && tab === "settings";
  return pathname.startsWith(`/operator/${match}`);
}

export function OperatorShell({ identity, children }: { identity: OperatorIdentity; children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const visibleNavigation = identity.role === "admin"
    ? navigation
    : navigation.filter((item) => item.match !== "catalog" && item.match !== "settings" && item.match !== "team");
  const initials = identity.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-ink print:bg-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-ink px-4 py-5 text-white lg:flex print:hidden">
        <Link href="/operator" className="flex items-center gap-3 px-2">
          <Image src="/logo-mr-delivery.jpeg" alt="Mr. Delivery" width={44} height={44} className="h-11 w-11 rounded-lg bg-white object-cover" />
          <div className="min-w-0">
            <p className="font-black">Mr. Delivery</p>
            <p className="text-xs font-bold text-white/50">Espace Équipe</p>
          </div>
        </Link>

        <nav aria-label="Navigation équipe" className="mt-8 space-y-1.5">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, tab, item.match);
            return (
              <Link
                key={item.match}
                href={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-lg px-4 text-sm font-black transition ${
                  active ? "bg-gold text-ink" : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-black text-ink">{initials || "MR"}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{identity.displayName}</p>
              <p className="truncate text-xs text-white/50">{identity.authMode === "emergency" ? "Accès de secours" : identity.role === "admin" ? "Administrateur" : "Opérateur"}</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href="/" target="_blank" className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white/8 text-xs font-black hover:bg-white/15">
              <ExternalLink size={15} /> Site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-white/8 text-xs font-black hover:bg-white/15">
                <LogOut size={15} /> Sortir
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-ink/8 bg-[#f7f6f2]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:hidden print:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/operator" className="flex min-w-0 items-center gap-2.5">
              <Image src="/logo-mr-delivery.jpeg" alt="Mr. Delivery" width={38} height={38} className="h-9 w-9 rounded-lg bg-white object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black">Espace Équipe</p>
                <p className="truncate text-[0.68rem] font-bold text-neutral-500">{identity.displayName}</p>
              </div>
            </Link>
            <form action={logoutAction}>
              <button type="submit" title="Se déconnecter" aria-label="Se déconnecter" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
                <LogOut size={17} />
              </button>
            </form>
          </div>

          <nav aria-label="Navigation équipe mobile" className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, tab, item.match);
              return (
                <Link
                  key={item.match}
                  href={item.href}
                  className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-xs font-black transition ${
                    active ? "bg-ink text-white" : "border border-ink/10 bg-white text-neutral-600"
                  }`}
                >
                  <Icon size={15} /> {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {identity.authMode === "emergency" ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-bold text-amber-900 sm:px-6 print:hidden">
            Session de secours active pendant 30 minutes. Utilise-la uniquement pour récupérer ou initialiser les comptes personnels.
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</div>
      </div>
    </main>
  );
}
