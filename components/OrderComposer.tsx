"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { ArrowLeft, ArrowRight, Check, LocateFixed, MessageCircle, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { assistantNeeds, packageTypeOptions, packs, urgencyOptions } from "@/lib/data";
import { generateCustomOrderMessage, generateMapsLink, generateWhatsAppLink, type OrderMessageInput } from "@/lib/whatsapp";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const stepLabels = ["Besoin", "Colis", "Coordonnées", "Confirmation"];

const initialOrder: OrderMessageInput = {
  name: "",
  phone: "",
  service: assistantNeeds[0].service,
  need: assistantNeeds[0].label,
  urgency: urgencyOptions[0].label,
  pickup: "",
  destination: "",
  pickupMapUrl: "",
  destinationMapUrl: "",
  packageType: packageTypeOptions[0],
  details: "",
  packName: assistantNeeds[0].packName,
};

function recommendPack(needLabel?: string, urgencyLabel?: string) {
  const need = assistantNeeds.find((item) => item.label === needLabel) ?? assistantNeeds[0];

  if (need.id === "cargo" || need.id === "intercity" || need.id === "health") {
    return need;
  }

  if (urgencyLabel === "Le plus vite possible") {
    return assistantNeeds[0];
  }

  return need;
}

export function OrderComposer() {
  const scope = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<OrderMessageInput>(initialOrder);
  const [locatingField, setLocatingField] = useState<"pickupMapUrl" | "destinationMapUrl" | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);
  const startedRef = useRef(false);
  const sentRef = useRef(false);
  const completedTrackedRef = useRef(false);
  const currentStepRef = useRef(0);

  const recommendation = useMemo(() => recommendPack(order.need, order.urgency), [order.need, order.urgency]);
  const recommendedPack = useMemo(
    () => packs.find((pack) => pack.name === recommendation.packName) ?? packs[0],
    [recommendation.packName],
  );
  const completedFields = useMemo(
    () => [order.need, order.urgency, order.packageType, order.name, order.phone, order.pickup, order.destination].filter(Boolean).length,
    [order],
  );
  const message = useMemo(
    () =>
      generateCustomOrderMessage({
        ...order,
        service: recommendation.service,
        packName: recommendation.packName,
      }),
    [order, recommendation],
  );
  const whatsappLink = useMemo(() => generateWhatsAppLink(message), [message]);
  const requestIsComplete = Boolean(
    order.name?.trim() && order.phone?.trim() && order.pickup?.trim() && order.destination?.trim(),
  );

  useEffect(() => {
    currentStepRef.current = step;
    if (step === 3 && !completedTrackedRef.current) {
      completedTrackedRef.current = true;
      track("order_form_completed", { pack: recommendation.packName });
    }
  }, [recommendation.packName, step]);

  useEffect(
    () => () => {
      if (startedRef.current && !sentRef.current) {
        track("order_form_abandoned", { step: String(currentStepRef.current + 1) });
      }
    },
    [],
  );

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        return;
      }

      const isMobile = window.matchMedia("(max-width: 640px)").matches;

      gsap.from(".assistant-shell", {
        autoAlpha: 0,
        y: isMobile ? 16 : 36,
        duration: isMobile ? 0.95 : 0.75,
        ease: isMobile ? "power2.out" : "power3.out",
        scrollTrigger: {
          trigger: scope.current,
          start: "top 78%",
          once: true,
        },
      });
    },
    { scope },
  );

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        return;
      }

      const isMobile = window.matchMedia("(max-width: 640px)").matches;

      gsap.fromTo(
        ".assistant-step",
        { autoAlpha: 0, x: isMobile ? 8 : 22, y: isMobile ? 6 : 0 },
        { autoAlpha: 1, x: 0, y: 0, duration: isMobile ? 0.48 : 0.36, ease: "power2.out" },
      );
    },
    { scope, dependencies: [step] },
  );

  function updateOrder(field: keyof OrderMessageInput, value: string) {
    setOrder((current) => ({ ...current, [field]: value }));
  }

  function captureLocation(field: "pickupMapUrl" | "destinationMapUrl") {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }

    setLocatingField(field);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const mapUrl = generateMapsLink(position.coords.latitude, position.coords.longitude);
        updateOrder(field, mapUrl);
        setLocationMessage("Position ajoutée au message WhatsApp.");
        setLocatingField(null);
      },
      () => {
        setLocationMessage("Position non récupérée. Vous pouvez continuer avec l'adresse manuelle.");
        setLocatingField(null);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  function selectNeed(label: string) {
    const selectedNeed = assistantNeeds.find((need) => need.label === label) ?? assistantNeeds[0];
    setOrder((current) => ({
      ...current,
      need: selectedNeed.label,
      service: selectedNeed.service,
      packName: selectedNeed.packName,
    }));
  }

  function nextStep() {
    startedRef.current = true;
    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  }

  function handleWhatsAppClick() {
    sentRef.current = true;
    track("whatsapp_order_opened", { pack: recommendation.packName });
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <section
      id="commande"
      ref={scope}
      data-nav-theme="light"
      className="bg-[#fff7df] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="assistant-shell mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Assistant livraison</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
              Trouvez la bonne livraison avant d'écrire sur WhatsApp
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-700">
              Répondez à quelques questions. Mr. Delivery vous propose le pack le plus logique et prépare un message
              clair pour l'équipe.
            </p>

            <div className="mt-6 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Pack recommandé</p>
                  <h3 className="mt-2 text-2xl font-black text-ink">{recommendedPack.name}</h3>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-ink">
                  <Sparkles size={23} />
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-amberSoft p-3">
                  <p className="text-xs font-black uppercase text-neutral-500">Prix</p>
                  <p className="mt-1 text-sm font-black text-ink">{recommendedPack.price}</p>
                </div>
                <div className="rounded-lg bg-amberSoft p-3">
                  <p className="text-xs font-black uppercase text-neutral-500">Délai</p>
                  <p className="mt-1 text-sm font-black text-ink">{recommendedPack.delay}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold leading-5 text-neutral-500">
                Recommandation indicative. L'équipe confirme toujours la disponibilité et le tarif final via WhatsApp.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-ink">
                  Étape {step + 1} / {stepLabels.length}
                </p>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">{stepLabels[step]}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full rounded-full bg-gold transition-all duration-300"
                  style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="assistant-step min-h-[28rem]">
              {step === 0 ? (
                <div>
                  <h3 className="text-2xl font-black text-ink">De quoi avez-vous besoin ?</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Choisissez le cas le plus proche. Le pack s'ajuste automatiquement.
                  </p>
                  <div className="mt-5 grid gap-3">
                    {assistantNeeds.map((need) => {
                      const isSelected = order.need === need.label;

                      return (
                        <button
                          key={need.id}
                          type="button"
                          onClick={() => selectNeed(need.label)}
                          className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${
                            isSelected ? "border-gold bg-amberSoft shadow-gold" : "border-ink/8 bg-[#fffdf7] hover:border-gold/60"
                          }`}
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span>
                              <span className="block text-sm font-black text-ink">{need.label}</span>
                              <span className="mt-1 block text-sm leading-6 text-neutral-600">{need.description}</span>
                            </span>
                            {isSelected ? <Check className="shrink-0 text-gold" size={21} /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <h3 className="text-2xl font-black text-ink">Précisez l'urgence et le colis</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Urgence</span>
                      <select
                        value={order.urgency}
                        onChange={(event) => updateOrder("urgency", event.target.value)}
                        className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
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
                        value={order.packageType}
                        onChange={(event) => updateOrder("packageType", event.target.value)}
                        className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                      >
                        {packageTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Détails utiles</span>
                      <textarea
                        value={order.details}
                        onChange={(event) => updateOrder("details", event.target.value)}
                        placeholder="Ex: colis fragile, repas chaud, besoin de photo, point de repère..."
                        rows={5}
                        className="mt-2 w-full resize-none rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                      />
                    </label>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <h3 className="text-2xl font-black text-ink">Où doit-on récupérer et livrer ?</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Nom</span>
                      <input
                        value={order.name}
                        onChange={(event) => updateOrder("name", event.target.value)}
                        placeholder="Votre nom"
                        maxLength={100}
                        className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Téléphone</span>
                      <input
                        value={order.phone}
                        onChange={(event) => updateOrder("phone", event.target.value)}
                        placeholder="+243 ..."
                        type="tel"
                        inputMode="tel"
                        maxLength={20}
                        className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Ramassage</span>
                      <input
                        value={order.pickup}
                        onChange={(event) => updateOrder("pickup", event.target.value)}
                        placeholder="Adresse de ramassage"
                        maxLength={240}
                        className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                      />
                      <button
                        type="button"
                        onClick={() => captureLocation("pickupMapUrl")}
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-amberSoft px-4 py-2.5 text-xs font-black text-ink transition hover:border-gold hover:bg-gold"
                      >
                        <LocateFixed size={16} />
                        {locatingField === "pickupMapUrl" ? "Localisation..." : "Utiliser ma position"}
                      </button>
                      {order.pickupMapUrl ? (
                        <a
                          href={order.pickupMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block text-xs font-bold text-neutral-600 underline"
                        >
                          Voir le point de ramassage
                        </a>
                      ) : null}
                    </label>
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Destination</span>
                      <input
                        value={order.destination}
                        onChange={(event) => updateOrder("destination", event.target.value)}
                        placeholder="Adresse de livraison"
                        maxLength={240}
                        className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
                      />
                      <button
                        type="button"
                        onClick={() => captureLocation("destinationMapUrl")}
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-amberSoft px-4 py-2.5 text-xs font-black text-ink transition hover:border-gold hover:bg-gold"
                      >
                        <LocateFixed size={16} />
                        {locatingField === "destinationMapUrl" ? "Localisation..." : "Utiliser ma position"}
                      </button>
                      {order.destinationMapUrl ? (
                        <a
                          href={order.destinationMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block text-xs font-bold text-neutral-600 underline"
                        >
                          Voir le point de livraison
                        </a>
                      ) : null}
                    </label>
                  </div>
                  {locationMessage ? <p className="mt-4 text-sm font-bold text-neutral-600">{locationMessage}</p> : null}
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <h3 className="text-2xl font-black text-ink">Votre demande est prête</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-amberSoft p-4">
                      <p className="text-xs font-black uppercase text-neutral-500">Complétion</p>
                      <p className="mt-1 text-xl font-black text-ink">{completedFields}/7</p>
                    </div>
                    <div className="rounded-lg bg-amberSoft p-4">
                      <p className="text-xs font-black uppercase text-neutral-500">Pack</p>
                      <p className="mt-1 text-sm font-black text-ink">{recommendation.packName}</p>
                    </div>
                    <div className="rounded-lg bg-amberSoft p-4">
                      <p className="text-xs font-black uppercase text-neutral-500">Canal</p>
                      <p className="mt-1 text-sm font-black text-ink">WhatsApp</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-lg border border-ink/8 bg-ink p-4 text-white">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gold">
                      <MessageCircle size={16} />
                      Aperçu du message
                    </p>
                    <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-white/74">
                      {message}
                    </pre>
                  </div>
                  <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-ink/10 bg-white p-4">
                    <input
                      type="checkbox"
                      checked={confirmationAccepted}
                      onChange={(event) => setConfirmationAccepted(event.target.checked)}
                      className="mt-1 h-5 w-5 accent-[#f4b400]"
                    />
                    <span className="text-sm font-semibold leading-6 text-neutral-700">
                      Je comprends que l’envoi du message est une demande. La commande est enregistrée uniquement après confirmation du prix, du paiement et de la disponibilité par Mr. Delivery.
                    </span>
                  </label>
                  {!requestIsComplete ? (
                    <p className="mt-3 text-sm font-bold text-red-700">Ajoutez votre nom, téléphone, lieu de ramassage et destination avant l’envoi.</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 0}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 px-5 py-3 text-sm font-black text-ink transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft size={17} />
                Retour
              </button>

              {step < stepLabels.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-gold hover:text-ink"
                >
                  Continuer
                  <ArrowRight size={17} />
                </button>
              ) : confirmationAccepted && requestIsComplete ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleWhatsAppClick}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-black text-ink shadow-gold transition hover:-translate-y-0.5 hover:bg-ink hover:text-white"
                >
                  Envoyer sur WhatsApp
                  <ArrowRight size={17} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-neutral-200 px-6 py-3 text-sm font-black text-neutral-500"
                >
                  Confirmez les informations
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
