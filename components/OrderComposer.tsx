"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, LocateFixed, MapPin, MessageCircle, PackageCheck, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { assistantNeeds, packageTypeOptions, packs, urgencyOptions } from "@/lib/data";
import { generateCustomOrderMessage, generateMapsLink, generateWhatsAppLink, type OrderMessageInput } from "@/lib/whatsapp";
import { triggerHaptic } from "@/lib/haptics";
import { motion, prefersReducedMotion } from "@/lib/motion";

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
  const scope = useRef<HTMLElement>(null);
  const assistantCardRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef(1);
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<OrderMessageInput>(initialOrder);
  const [locatingField, setLocatingField] = useState<"pickupMapUrl" | "destinationMapUrl" | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [confirmationAccepted, setConfirmationAccepted] = useState(false);
  const [stepError, setStepError] = useState("");
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
      const reduceMotion = prefersReducedMotion();

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
      const reduceMotion = prefersReducedMotion();

      if (reduceMotion) {
        return;
      }

      const isMobile = window.matchMedia("(max-width: 640px)").matches;

      const direction = directionRef.current;
      gsap.fromTo(
        ".assistant-step",
        { autoAlpha: 0, x: (isMobile ? 14 : 24) * direction, y: isMobile ? 4 : 0 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: isMobile ? motion.duration.base : 0.36,
          ease: motion.ease.soft,
          onComplete: () => {
            if (startedRef.current) {
              const heading = scope.current?.querySelector<HTMLElement>(".assistant-step h3");
              heading?.focus({ preventScroll: true });
            }
          },
        },
      );

      if (step === 3) {
        gsap.fromTo(".confirmation-route", { scaleX: 0 }, { scaleX: 1, duration: 0.65, transformOrigin: "left", ease: motion.ease.exit });
        gsap.fromTo(
          ".confirmation-package",
          { x: 0, scale: 0.85 },
          { x: () => Math.max((assistantCardRef.current?.clientWidth ?? 320) - 122, 170), scale: 1, duration: 0.72, ease: motion.ease.exit },
        );
      }
    },
    { scope, dependencies: [step] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".recommendation-card",
        { scale: 0.985, y: 5 },
        { scale: 1, y: 0, duration: 0.42, ease: motion.ease.spring },
      );
    },
    { scope, dependencies: [recommendation.packName] },
  );

  function updateOrder(field: keyof OrderMessageInput, value: string) {
    setOrder((current) => ({ ...current, [field]: value }));
    if (stepError) setStepError("");
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
        triggerHaptic("success");
        track("order_gps_added", { field: field === "pickupMapUrl" ? "pickup" : "destination" });
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
    triggerHaptic("select");
  }

  function nextStep() {
    if (!startedRef.current) {
      track("assistant_journey_started", { entryStep: stepLabels[step] });
    }
    startedRef.current = true;
    if (step === 2 && !requestIsComplete) {
      setStepError("Ajoutez votre nom, téléphone, lieu de ramassage et destination pour continuer.");
      triggerHaptic("error");
      if (assistantCardRef.current) {
        gsap.fromTo(assistantCardRef.current, { x: -5 }, { x: 0, duration: 0.36, ease: "elastic.out(1, 0.35)", clearProps: "transform" });
      }
      return;
    }
    setStepError("");
    triggerHaptic("select");
    track("assistant_step_completed", { step: stepLabels[step], nextStep: stepLabels[Math.min(step + 1, stepLabels.length - 1)] });
    directionRef.current = 1;
    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
    window.setTimeout(() => assistantCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function handleWhatsAppClick() {
    sentRef.current = true;
    triggerHaptic("success");
    track("whatsapp_order_opened", { pack: recommendation.packName });
  }

  function previousStep() {
    directionRef.current = -1;
    triggerHaptic("select");
    setStep((current) => Math.max(current - 1, 0));
    window.setTimeout(() => assistantCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  return (
    <section
      id="commande"
      ref={scope}
      data-nav-theme="light"
      className="scroll-mt-20 bg-[#fff7df] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div className="assistant-shell mx-auto max-w-7xl">
        <div className="grid gap-5 sm:gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Assistant livraison</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-ink sm:mt-3 sm:text-4xl">
              Trouvez la bonne livraison avant d'écrire sur WhatsApp
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-700 sm:mt-4 sm:text-base sm:leading-7">
              Répondez à quelques questions. Mr. Delivery vous propose le pack le plus logique et prépare un message
              clair pour l'équipe.
            </p>

            <div className="recommendation-card mt-4 rounded-xl border border-ink/8 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-2xl sm:p-5" aria-live="polite">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Pack recommandé</p>
                  <h3 className="mt-1 text-xl font-black text-ink sm:mt-2 sm:text-2xl">{recommendedPack.name}</h3>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink sm:h-12 sm:w-12">
                  <Sparkles size={23} />
                </span>
              </div>
              <p className="mt-2 text-sm font-black text-ink sm:hidden">{recommendedPack.price} · {recommendedPack.delay}</p>
              <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-2">
                <div className="rounded-lg bg-amberSoft p-3">
                  <p className="text-xs font-black uppercase text-neutral-500">Prix</p>
                  <p className="mt-1 text-sm font-black text-ink">{recommendedPack.price}</p>
                </div>
                <div className="rounded-lg bg-amberSoft p-3">
                  <p className="text-xs font-black uppercase text-neutral-500">Délai</p>
                  <p className="mt-1 text-sm font-black text-ink">{recommendedPack.delay}</p>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold leading-5 text-neutral-500 sm:mt-4">
                Recommandation indicative. L'équipe confirme toujours la disponibilité et le tarif final via WhatsApp.
              </p>
            </div>
          </div>

          <div ref={assistantCardRef} className="assistant-card scroll-mt-20 rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-6">
            <div className="sticky top-[4.25rem] z-20 -mx-4 -mt-4 mb-5 border-b border-ink/6 bg-white/96 px-4 pb-3 pt-4 backdrop-blur sm:static sm:mx-0 sm:mt-0 sm:mb-6 sm:border-0 sm:bg-transparent sm:p-0">
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
              <div className="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
                {stepLabels.map((label, index) => (
                  <span
                    key={label}
                    className={`h-1 rounded-full transition-colors duration-300 ${index <= step ? "bg-gold" : "bg-ink/8"}`}
                  />
                ))}
              </div>
            </div>

            <div className="assistant-step min-h-0 pb-2 sm:min-h-[28rem] sm:pb-0">
              {step === 0 ? (
                <div>
                  <h3 tabIndex={-1} className="text-2xl font-black text-ink outline-none">De quoi avez-vous besoin ?</h3>
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
                          className={`rounded-lg border p-3.5 text-left transition active:scale-[0.99] sm:p-4 ${
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
                  <h3 tabIndex={-1} className="text-2xl font-black text-ink outline-none">Précisez l'urgence et le colis</h3>
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
                  <h3 tabIndex={-1} className="text-2xl font-black text-ink outline-none">Où doit-on récupérer et livrer ?</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Nom</span>
                      <input
                        value={order.name}
                        onChange={(event) => updateOrder("name", event.target.value)}
                        aria-invalid={Boolean(stepError && !order.name?.trim())}
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
                        aria-invalid={Boolean(stepError && !order.phone?.trim())}
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
                        aria-invalid={Boolean(stepError && !order.pickup?.trim())}
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
                        aria-invalid={Boolean(stepError && !order.destination?.trim())}
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
                  {locationMessage ? (
                    <p className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-green-800" role="status">
                      <CheckCircle2 size={18} /> {locationMessage}
                    </p>
                  ) : null}
                  {stepError ? (
                    <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      {stepError}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle2 size={24} />
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-green-700">Tout est prêt</p>
                      <h3 tabIndex={-1} className="mt-1 text-2xl font-black text-ink outline-none">
                        {order.name?.trim() ? `${order.name.trim().split(/\s+/)[0]}, votre demande est prête` : "Votre demande est prête"}
                      </h3>
                    </div>
                  </div>
                  <div className="relative mt-5 h-16 overflow-hidden rounded-xl bg-[#fffdf7] px-5" aria-hidden="true">
                    <span className="absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink/10" />
                    <span className="confirmation-route absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold" />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-ink" size={21} />
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gold" size={21} />
                    <span className="confirmation-package absolute left-9 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-gold shadow-soft">
                      <PackageCheck size={18} />
                    </span>
                  </div>
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
                      onChange={(event) => {
                        setConfirmationAccepted(event.target.checked);
                        triggerHaptic("select");
                      }}
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

            <div className="sticky bottom-[4.7rem] z-20 -mx-4 mt-5 flex flex-col gap-3 border-t border-ink/8 bg-white/96 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0">
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
