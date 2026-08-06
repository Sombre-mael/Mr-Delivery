"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  BarChart3,
  Clock3,
  ExternalLink,
  FileText,
  LogOut,
  MessageCircle,
  PackageCheck,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import QRCode from "qrcode";
import { archiveOrderAction, createOrderAction, logoutAction, updateOrderAction } from "@/app/operator/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { assistantNeeds, packageTypeOptions, packs, urgencyOptions } from "@/lib/data";
import type { DeliveryOrder } from "@/lib/orders";
import {
  deliveryStatusLabels,
  generateClientWhatsAppLink,
  generateStatusMessage,
  type DeliveryStatus,
  type StatusMessageInput,
} from "@/lib/whatsapp";

const statusOptions = Object.entries(deliveryStatusLabels) as Array<[DeliveryStatus, string]>;

function createClientInvoiceNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const bytes = new Uint8Array(3);
  globalThis.crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `MRD-${date}-${suffix}`;
}
const historyFilters: Array<{ label: string; value: "all" | DeliveryStatus }> = [
  { label: "Toutes", value: "all" },
  { label: "Paiement", value: "payment_pending" },
  { label: "Récupéré", value: "picked_up" },
  { label: "En livraison", value: "in_delivery" },
  { label: "Livré", value: "delivered" },
  { label: "Problème", value: "issue" },
];

type OperatorForm = Omit<StatusMessageInput, "notes"> & {
  service: string;
  need: string;
  urgency: string;
  pickupMapUrl: string;
  destinationMapUrl: string;
  packageType: string;
  internalNotes: string;
  publicNote: string;
};

const emptyOrder: OperatorForm = {
  customerName: "",
  customerPhone: "",
  invoiceNumber: "",
  service: assistantNeeds[0].service,
  need: assistantNeeds[0].label,
  urgency: urgencyOptions[0].label,
  packName: "Pack Pro",
  amount: "",
  paymentStatus: "Paiement attendu",
  pickup: "",
  destination: "",
  pickupMapUrl: "",
  destinationMapUrl: "",
  packageType: packageTypeOptions[0],
  internalNotes: "",
  publicNote: "",
  status: "payment_pending",
};

function orderToForm(order: DeliveryOrder): OperatorForm {
  return {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    invoiceNumber: order.invoiceNumber,
    service: order.service || assistantNeeds[0].service,
    need: order.need || assistantNeeds[0].label,
    urgency: order.urgency || urgencyOptions[0].label,
    packName: order.packName || "Pack Pro",
    amount: order.amount,
    paymentStatus: order.paymentStatus || "Paiement attendu",
    pickup: order.pickup,
    destination: order.destination,
    pickupMapUrl: order.pickupMapUrl,
    destinationMapUrl: order.destinationMapUrl,
    packageType: order.packageType || packageTypeOptions[0],
    internalNotes: order.internalNotes,
    publicNote: order.publicNote,
    status: order.status,
  };
}

function buildInvoicePayload(order: OperatorForm, trackingCode: string, trackingUrl: string) {
  return [
    "FACTURE MR. DELIVERY",
    `Numéro : ${order.invoiceNumber || "À générer"}`,
    `Code suivi : ${trackingCode || "Après création"}`,
    `Suivi : ${trackingUrl}`,
    `Client : ${order.customerName || "À confirmer"}`,
    `Téléphone : ${order.customerPhone || "À confirmer"}`,
    `Service : ${order.service || "À confirmer"}`,
    `Besoin : ${order.need || "À confirmer"}`,
    `Urgence : ${order.urgency || "À confirmer"}`,
    `Pack : ${order.packName || "À confirmer"}`,
    `Type colis : ${order.packageType || "À confirmer"}`,
    `Montant : ${order.amount || "À confirmer"}`,
    `Paiement : ${order.paymentStatus || "À confirmer"}`,
    `Statut : ${deliveryStatusLabels[order.status]}`,
    `Ramassage : ${order.pickup || "À confirmer"}`,
    `Livraison : ${order.destination || "À confirmer"}`,
  ].join("\n");
}

type OperatorConsoleProps = {
  orders: DeliveryOrder[];
  selectedTrackingCode?: string;
  appUrl: string;
  errorMessage?: string;
  savedState?: string;
};

export function OperatorConsole({ orders, selectedTrackingCode, appUrl, errorMessage, savedState }: OperatorConsoleProps) {
  const selectedOrder =
    orders.find((order) => order.trackingCode === selectedTrackingCode) ||
    orders[0] ||
    null;
  const [activeOrderId, setActiveOrderId] = useState(selectedOrder?.id || "");
  const activeOrder = orders.find((order) => order.id === activeOrderId) || null;
  const [form, setForm] = useState<OperatorForm>(activeOrder ? orderToForm(activeOrder) : emptyOrder);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyStatus, setHistoryStatus] = useState<"all" | DeliveryStatus>("all");
  const [historyScope, setHistoryScope] = useState<"active" | "archived">("active");

  const trackingCode = activeOrder?.trackingCode || "À créer";
  const trackingUrl = activeOrder ? `${appUrl.replace(/\/$/, "")}/track/${activeOrder.trackingCode}` : `${appUrl.replace(/\/$/, "")}/track`;
  const statusMessage = useMemo(() => generateStatusMessage({ ...form, notes: form.publicNote }), [form]);
  const clientWhatsAppLink = useMemo(
    () => generateClientWhatsAppLink(form.customerPhone, `${statusMessage}\n\nSuivi colis : ${trackingUrl}`),
    [form.customerPhone, statusMessage, trackingUrl],
  );
  const invoicePayload = useMemo(() => buildInvoicePayload(form, trackingCode, trackingUrl), [form, trackingCode, trackingUrl]);
  const activeOrders = useMemo(() => orders.filter((order) => !order.archivedAt), [orders]);
  const dashboardStats = useMemo(
    () => [
      {
        label: "Commandes",
        value: activeOrders.length,
        detail: "Commandes actives",
        icon: BarChart3,
        tone: "bg-ink text-white",
      },
      {
        label: "Paiement attendu",
        value: activeOrders.filter((order) => order.status === "payment_pending").length,
        detail: "À confirmer",
        icon: Clock3,
        tone: "bg-gold text-ink",
      },
      {
        label: "En livraison",
        value: activeOrders.filter((order) => order.status === "in_delivery").length,
        detail: "Courses actives",
        icon: Truck,
        tone: "bg-ink text-gold",
      },
      {
        label: "Livrées",
        value: activeOrders.filter((order) => order.status === "delivered").length,
        detail: "Terminées",
        icon: PackageCheck,
        tone: "bg-white text-ink",
      },
    ],
    [activeOrders],
  );
  const filteredOrders = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = historyStatus === "all" || order.status === historyStatus;
      const matchesScope = historyScope === "archived" ? Boolean(order.archivedAt) : !order.archivedAt;
      const haystack = [
        order.customerName,
        order.customerPhone,
        order.trackingCode,
        order.invoiceNumber,
        order.packName,
        order.paymentStatus,
        deliveryStatusLabels[order.status],
      ]
        .join(" ")
        .toLowerCase();

      return matchesScope && matchesStatus && (!query || haystack.includes(query));
    });
  }, [historyQuery, historyScope, historyStatus, orders]);

  useEffect(() => {
    if (activeOrder) {
      setForm(orderToForm(activeOrder));
      return;
    }

    setForm({ ...emptyOrder, invoiceNumber: createClientInvoiceNumber() });
  }, [activeOrder]);

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(trackingUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrDataUrl("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [trackingUrl]);

  function updateForm(field: keyof OperatorForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startNewOrder() {
    setActiveOrderId("");
    setForm({ ...emptyOrder, invoiceNumber: createClientInvoiceNumber() });
  }

  function printInvoice() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-[#fffdf7] px-4 py-8 text-ink sm:px-6 lg:px-8 print:bg-white print:px-0 print:py-0">
      <section className="mx-auto max-w-7xl print:hidden">
        {errorMessage ? (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage === "save" ? "La commande n’a pas pu être enregistrée. Réessayez." : errorMessage}
          </div>
        ) : null}
        {savedState ? (
          <div role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
            {savedState === "archived"
              ? "Commande archivée."
              : savedState === "restored"
                ? "Commande restaurée."
                : "Commande enregistrée avec succès."}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Console équipe</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Commandes, suivi client et facture QR</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Créez une commande, changez son statut, envoyez la relance WhatsApp et donnez au client un QR de suivi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-ink/10 px-5 py-3 text-sm font-black transition hover:border-gold"
            >
              Retour au site
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink"
              >
                <LogOut size={16} />
                Sortir
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article key={stat.label} className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-black text-ink">{stat.value}</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-500">{stat.detail}</p>
                  </div>
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${stat.tone}`}>
                    <Icon size={22} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
          <aside className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Commandes</h2>
                <p className="text-sm text-neutral-600">{activeOrders.length} commande(s) actives</p>
              </div>
              <button
                type="button"
                onClick={startNewOrder}
                className="rounded-full bg-gold px-4 py-2 text-xs font-black text-ink transition hover:bg-ink hover:text-white"
              >
                Nouvelle
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {activeOrders.length ? (
                activeOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setActiveOrderId(order.id)}
                    className={`w-full rounded-xl border p-4 text-left transition hover:border-gold ${
                      activeOrderId === order.id ? "border-gold bg-gold/10" : "border-ink/10 bg-[#fffdf7]"
                    }`}
                  >
                    <span className="block text-sm font-black">{order.customerName || "Client à confirmer"}</span>
                    <span className="mt-1 block text-xs font-bold text-neutral-500">{order.trackingCode}</span>
                    <span className="mt-3 inline-flex rounded-full bg-ink px-3 py-1 text-xs font-black text-white">
                      {deliveryStatusLabels[order.status]}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-ink/15 p-5 text-sm leading-6 text-neutral-600">
                  Aucune commande pour le moment. Créez la première commande après confirmation WhatsApp.
                </div>
              )}
            </div>
          </aside>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <form
              action={activeOrder ? updateOrderAction : createOrderAction}
              className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-6"
            >
              {activeOrder ? <input type="hidden" name="orderId" value={activeOrder.id} /> : null}
              {activeOrder ? <input type="hidden" name="trackingCode" value={activeOrder.trackingCode} /> : null}

              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink">
                  <FileText size={22} />
                </span>
                <div>
                  <h2 className="text-xl font-black">{activeOrder ? "Modifier la commande" : "Nouvelle commande"}</h2>
                  <p className="text-sm text-neutral-600">
                    {activeOrder ? `Code suivi : ${activeOrder.trackingCode}` : "Le code suivi sera créé automatiquement."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Client</span>
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={(event) => updateForm("customerName", event.target.value)}
                    placeholder="Nom du client"
                    required
                    maxLength={100}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Téléphone client</span>
                  <input
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={(event) => updateForm("customerPhone", event.target.value)}
                    placeholder="+243 ..."
                    required
                    inputMode="tel"
                    maxLength={20}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Facture</span>
                  <div className="mt-2 flex gap-2">
                    <input
                      name="invoiceNumber"
                      value={form.invoiceNumber}
                      onChange={(event) => updateForm("invoiceNumber", event.target.value)}
                      maxLength={60}
                      className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                    />
                    <button
                      type="button"
                      onClick={() => updateForm("invoiceNumber", createClientInvoiceNumber())}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink text-white transition hover:bg-gold hover:text-ink"
                      aria-label="Régénérer le numéro de facture"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Pack</span>
                  <select
                    name="packName"
                    value={form.packName}
                    onChange={(event) => updateForm("packName", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    {packs.map((pack) => (
                      <option key={pack.name} value={pack.name}>
                        {pack.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Service</span>
                  <select
                    name="service"
                    value={form.service}
                    onChange={(event) => updateForm("service", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    {Array.from(new Set(assistantNeeds.map((need) => need.service))).map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Besoin client</span>
                  <select
                    name="need"
                    value={form.need}
                    onChange={(event) => updateForm("need", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    {assistantNeeds.map((need) => (
                      <option key={need.id} value={need.label}>
                        {need.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Urgence</span>
                  <select
                    name="urgency"
                    value={form.urgency}
                    onChange={(event) => updateForm("urgency", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    {urgencyOptions.map((option) => (
                      <option key={option.id} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Type de colis</span>
                  <select
                    name="packageType"
                    value={form.packageType}
                    onChange={(event) => updateForm("packageType", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    {packageTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Montant</span>
                  <input
                    name="amount"
                    value={form.amount}
                    onChange={(event) => updateForm("amount", event.target.value)}
                    placeholder="Ex: 7 500 FC"
                    maxLength={40}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Paiement</span>
                  <select
                    name="paymentStatus"
                    value={form.paymentStatus}
                    onChange={(event) => updateForm("paymentStatus", event.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    <option>Paiement attendu</option>
                    <option>Paiement confirmé</option>
                    <option>Devis à confirmer</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Ramassage</span>
                  <input
                    name="pickup"
                    value={form.pickup}
                    onChange={(event) => updateForm("pickup", event.target.value)}
                    placeholder="Lieu de ramassage"
                    required
                    maxLength={240}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Livraison</span>
                  <input
                    name="destination"
                    value={form.destination}
                    onChange={(event) => updateForm("destination", event.target.value)}
                    placeholder="Lieu de livraison"
                    required
                    maxLength={240}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">GPS ramassage</span>
                  <input
                    name="pickupMapUrl"
                    value={form.pickupMapUrl}
                    onChange={(event) => updateForm("pickupMapUrl", event.target.value)}
                    placeholder="Lien Google Maps"
                    type="url"
                    maxLength={500}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">GPS livraison</span>
                  <input
                    name="destinationMapUrl"
                    value={form.destinationMapUrl}
                    onChange={(event) => updateForm("destinationMapUrl", event.target.value)}
                    placeholder="Lien Google Maps"
                    type="url"
                    maxLength={500}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Statut colis</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value as DeliveryStatus)}
                    className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  >
                    {statusOptions.map(([status, label]) => (
                      <option key={status} value={status}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Note visible par le client</span>
                  <textarea
                    name="publicNote"
                    value={form.publicNote}
                    onChange={(event) => updateForm("publicNote", event.target.value)}
                    placeholder="Ex: arrivée estimée à 14h30. N’ajoutez aucune référence de paiement."
                    rows={3}
                    maxLength={500}
                    className="mt-2 w-full resize-none rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Notes internes équipe</span>
                  <textarea
                    name="internalNotes"
                    value={form.internalNotes}
                    onChange={(event) => updateForm("internalNotes", event.target.value)}
                    placeholder="Référence paiement, livreur assigné, incident interne..."
                    rows={4}
                    maxLength={1000}
                    className="mt-2 w-full resize-none rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
                  />
                  <span className="mt-2 block text-xs font-semibold text-neutral-500">Ce contenu n’apparaît jamais sur le suivi client.</span>
                </label>
              </div>

              <PendingSubmitButton
                idleLabel={activeOrder ? "Enregistrer les modifications" : "Créer la commande"}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-60"
              />
            </form>

            {activeOrder && (activeOrder.status === "delivered" || activeOrder.archivedAt) ? (
              <form action={archiveOrderAction} className="lg:col-span-2">
                <input type="hidden" name="orderId" value={activeOrder.id} />
                <input type="hidden" name="archived" value={activeOrder.archivedAt ? "false" : "true"} />
                <PendingSubmitButton
                  idleLabel={activeOrder.archivedAt ? "Restaurer la commande" : "Archiver la commande livrée"}
                  pendingLabel="Mise à jour..."
                  className="inline-flex w-full items-center justify-center rounded-full border border-ink/10 bg-white px-6 py-3 text-sm font-black transition hover:border-gold disabled:cursor-wait disabled:opacity-60"
                />
              </form>
            ) : null}

            <div className="space-y-6">
              <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-6">
                <h2 className="text-xl font-black">Relance client</h2>
                <div className="mt-5 rounded-lg bg-ink p-4 text-white">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gold">
                    <MessageCircle size={16} />
                    Message WhatsApp
                  </p>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-5 text-white/74">
                    {statusMessage}
                    {"\n\n"}
                    Suivi colis : {trackingUrl}
                  </pre>
                </div>

                <a
                  href={clientWhatsAppLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-black text-ink shadow-gold transition hover:-translate-y-0.5 hover:bg-ink hover:text-white"
                >
                  Envoyer la relance
                  <ArrowRight size={18} />
                </a>
              </div>

              <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">Facture QR</h2>
                    <p className="mt-1 text-sm text-neutral-600">Le QR ouvre la page de suivi client.</p>
                  </div>
                  <button
                    type="button"
                    onClick={printInvoice}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition hover:bg-gold hover:text-ink"
                    aria-label="Imprimer la facture"
                  >
                    <Printer size={19} />
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-4 rounded-lg bg-[#fffdf7] p-4">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-white">
                    {qrDataUrl ? <img src={qrDataUrl} alt="QR code suivi colis" className="h-24 w-24" /> : <QrCode size={48} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black">{form.invoiceNumber}</p>
                    <p className="mt-1 text-sm text-neutral-600">{form.customerName || "Client à confirmer"}</p>
                    <p className="mt-1 text-sm font-black text-ink">{trackingCode}</p>
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-black text-gold transition hover:text-ink"
                    >
                      Ouvrir le suivi
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <pre className="mt-4 hidden whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 sm:block">
                  {invoicePayload}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Historique</p>
              <h2 className="mt-1 text-2xl font-black">Toutes les commandes passées</h2>
            </div>
            <p className="text-sm font-bold text-neutral-500">
              {filteredOrders.length} résultat(s)
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                value={historyQuery}
                onChange={(event) => setHistoryQuery(event.target.value)}
                placeholder="Rechercher nom, téléphone, code, pack..."
                className="min-h-12 w-full rounded-full border border-ink/10 bg-[#fffdf7] pl-11 pr-4 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setHistoryScope("active")}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                  historyScope === "active" ? "bg-gold text-ink" : "border border-ink/10 bg-white text-ink"
                }`}
              >
                Actives
              </button>
              <button
                type="button"
                onClick={() => setHistoryScope("archived")}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
                  historyScope === "archived" ? "bg-gold text-ink" : "border border-ink/10 bg-white text-ink"
                }`}
              >
                {historyScope === "archived" ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                Archives
              </button>
              {historyFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setHistoryStatus(filter.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                    historyStatus === filter.value ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink hover:border-gold"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length ? (
            <>
              <div className="mt-5 hidden overflow-x-auto lg:block">
                <table className="min-w-[920px] w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    <th className="py-3 pr-4">Client</th>
                    <th className="py-3 pr-4">Téléphone</th>
                    <th className="py-3 pr-4">Code</th>
                    <th className="py-3 pr-4">Pack</th>
                    <th className="py-3 pr-4">Statut</th>
                    <th className="py-3 pr-4">Paiement</th>
                    <th className="py-3 pr-4">Montant</th>
                    <th className="py-3 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-ink/6 last:border-0">
                      <td className="py-4 pr-4 font-black">{order.customerName || "À confirmer"}</td>
                      <td className="py-4 pr-4 font-bold text-neutral-600">{order.customerPhone || "À confirmer"}</td>
                      <td className="py-4 pr-4 font-black text-gold">{order.trackingCode}</td>
                      <td className="py-4 pr-4 font-bold text-neutral-600">{order.packName || "À confirmer"}</td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full bg-ink px-3 py-1 text-xs font-black text-white">
                          {deliveryStatusLabels[order.status]}
                        </span>
                      </td>
                      <td className="py-4 pr-4 font-bold text-neutral-600">{order.paymentStatus || "À confirmer"}</td>
                      <td className="py-4 pr-4 font-bold text-neutral-600">{order.amount || "À confirmer"}</td>
                      <td className="py-4 pr-4">
                        <button
                          type="button"
                          onClick={() => setActiveOrderId(order.id)}
                          className="rounded-full border border-ink/10 px-4 py-2 text-xs font-black transition hover:border-gold hover:bg-gold"
                        >
                          Ouvrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="mt-5 grid gap-3 lg:hidden">
                {filteredOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-ink/10 bg-[#fffdf7] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-black">{order.customerName || "À confirmer"}</p>
                        <p className="mt-1 text-xs font-bold text-neutral-500">{order.customerPhone || "Téléphone à confirmer"}</p>
                      </div>
                      <span className="rounded-full bg-ink px-3 py-1 text-[0.68rem] font-black text-white">
                        {deliveryStatusLabels[order.status]}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <p>
                        <span className="block font-black uppercase text-neutral-500">Code</span>
                        <span className="mt-1 block font-black text-gold">{order.trackingCode}</span>
                      </p>
                      <p>
                        <span className="block font-black uppercase text-neutral-500">Pack</span>
                        <span className="mt-1 block font-bold text-neutral-700">{order.packName || "À confirmer"}</span>
                      </p>
                      <p>
                        <span className="block font-black uppercase text-neutral-500">Paiement</span>
                        <span className="mt-1 block font-bold text-neutral-700">{order.paymentStatus || "À confirmer"}</span>
                      </p>
                      <p>
                        <span className="block font-black uppercase text-neutral-500">Montant</span>
                        <span className="mt-1 block font-bold text-neutral-700">{order.amount || "À confirmer"}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveOrderId(order.id)}
                      className="mt-4 inline-flex w-full justify-center rounded-full bg-gold px-4 py-3 text-xs font-black text-ink transition hover:bg-ink hover:text-white"
                    >
                      Ouvrir cette commande
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-ink/15 p-5 text-sm leading-6 text-neutral-600">
              Aucune commande ne correspond à cette recherche.
            </div>
          )}
        </section>
      </section>

      <section className="mx-auto mt-8 hidden max-w-3xl bg-white p-8 text-ink print:block">
        <div className="flex items-start justify-between gap-6 border-b border-ink/10 pb-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Mr. Delivery</p>
            <h1 className="mt-2 text-3xl font-black">Facture client</h1>
            <p className="mt-1 text-sm text-neutral-600">Scannez le QR code pour suivre votre colis.</p>
          </div>
          {qrDataUrl ? <img src={qrDataUrl} alt="QR code suivi colis" className="h-28 w-28" /> : null}
        </div>

        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <p>
            <span className="font-black">Facture :</span> {form.invoiceNumber}
          </p>
          <p>
            <span className="font-black">Code suivi :</span> {trackingCode}
          </p>
          <p>
            <span className="font-black">Client :</span> {form.customerName || "À confirmer"}
          </p>
          <p>
            <span className="font-black">Téléphone :</span> {form.customerPhone || "À confirmer"}
          </p>
          <p>
            <span className="font-black">Pack :</span> {form.packName}
          </p>
          <p>
            <span className="font-black">Service :</span> {form.service || "À confirmer"}
          </p>
          <p>
            <span className="font-black">Type colis :</span> {form.packageType || "À confirmer"}
          </p>
          <p>
            <span className="font-black">Urgence :</span> {form.urgency || "À confirmer"}
          </p>
          <p>
            <span className="font-black">Montant :</span> {form.amount || "À confirmer"}
          </p>
          <p>
            <span className="font-black">Paiement :</span> {form.paymentStatus}
          </p>
          <p>
            <span className="font-black">Ramassage :</span> {form.pickup || "À confirmer"}
          </p>
          <p>
            <span className="font-black">Livraison :</span> {form.destination || "À confirmer"}
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-ink/10 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Statut</p>
          <p className="mt-2 text-lg font-black">{deliveryStatusLabels[form.status]}</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{trackingUrl}</p>
        </div>
      </section>
    </main>
  );
}
