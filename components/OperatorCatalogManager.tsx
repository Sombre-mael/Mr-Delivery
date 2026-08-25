import {
  Boxes,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  History,
  MapPin,
  Pencil,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import {
  updateBusinessSettingsAction,
  updatePackAction,
  updateServiceAction,
} from "@/app/operator/catalog/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import type { CatalogData } from "@/lib/catalog";
import type { IconName } from "@/lib/data";

type OperatorCatalogManagerProps = {
  catalog: CatalogData;
  activeTab: "packs" | "services" | "settings" | "history";
  errorMessage?: string;
  savedState?: string;
};

const iconOptions: Array<{ value: IconName; label: string }> = [
  { value: "zap", label: "Éclair" },
  { value: "package", label: "Colis" },
  { value: "fileText", label: "Document" },
  { value: "shirt", label: "Vêtement" },
  { value: "gem", label: "Objet précieux" },
  { value: "gift", label: "Cadeau" },
  { value: "heartPulse", label: "Santé" },
  { value: "truck", label: "Camion" },
];

const inputClass =
  "mt-2 min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15";
const labelClass = "text-xs font-black uppercase text-neutral-500";
const submitClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-60 sm:w-auto";

function UpdateMessage({ savedState }: { savedState?: string }) {
  if (!savedState) return null;
  const labels: Record<string, string> = {
    pack: "Pack mis à jour. Le nouveau contenu est maintenant disponible sur le site.",
    service: "Service mis à jour. Le nouveau contenu est maintenant disponible sur le site.",
    settings: "Coordonnées et horaires mis à jour.",
  };

  return (
    <div role="status" className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
      <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
      {labels[savedState] || "Modification enregistrée avec succès."}
    </div>
  );
}

export function OperatorCatalogManager({ catalog, activeTab, errorMessage, savedState }: OperatorCatalogManagerProps) {
  return (
    <div className="text-ink">
      <div>
        {errorMessage ? (
          <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        ) : null}
        <UpdateMessage savedState={savedState} />

        {catalog.usingFallback ? (
          <div role="alert" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            Les données locales de secours sont affichées. Appliquez la migration Neon avant toute modification.
          </div>
        ) : null}

        <header>
          <p className="text-xs font-black uppercase text-gold">Contenu commercial</p>
          <h1 className="mt-1 text-2xl font-black sm:text-3xl">Offres et réglages</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Modifiez uniquement la catégorie utile, sans parcourir toute la page.</p>
          <nav aria-label="Sections de gestion" className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1">
            {[
              ["packs", "Packs"],
              ["services", "Services"],
              ["settings", "Coordonnées"],
              ["history", "Historique"],
            ].map(([value, label]) => (
              <a key={value} href={`/operator/catalog?tab=${value}`} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black ${activeTab === value ? "bg-ink text-white" : "border border-ink/10 bg-white"}`}>{label}</a>
            ))}
          </nav>
        </header>

        <section id="packs-admin" className={`py-6 ${activeTab === "packs" ? "" : "hidden"}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase text-gold"><Boxes size={17} /> Catalogue</p>
              <h2 className="mt-2 text-2xl font-black">Packs et tarifs</h2>
            </div>
            <p className="text-sm font-semibold text-neutral-500">{catalog.packs.filter((pack) => pack.isActive).length} pack(s) visible(s)</p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {catalog.packs.map((pack) => (
              <article key={pack.id} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black">{pack.name}</h3>
                      {pack.popular ? <span className="rounded-full bg-gold px-2.5 py-1 text-[0.68rem] font-black">Populaire</span> : null}
                    </div>
                    <p className="mt-1 text-sm font-black text-gold">{pack.price}</p>
                    <p className="mt-1 text-xs font-semibold text-neutral-500">{pack.delay} · ordre {pack.sortOrder}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${pack.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {pack.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    {pack.isActive ? "Visible" : "Masqué"}
                  </span>
                </div>

                <details className="group mt-4 border-t border-ink/8 pt-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-black">
                    <span className="flex items-center gap-2"><Pencil size={16} /> Modifier ce pack</span>
                    <span className="text-xs text-neutral-500 group-open:hidden">Ouvrir</span>
                    <span className="hidden text-xs text-neutral-500 group-open:inline">Fermer</span>
                  </summary>
                  <form action={updatePackAction} className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="id" value={pack.id} />
                    <label><span className={labelClass}>Nom</span><input className={inputClass} name="name" defaultValue={pack.name} maxLength={80} required /></label>
                    <label><span className={labelClass}>Prix affiché</span><input className={inputClass} name="price" defaultValue={pack.price} maxLength={80} required /></label>
                    <label><span className={labelClass}>Public concerné</span><input className={inputClass} name="idealFor" defaultValue={pack.idealFor} maxLength={140} required /></label>
                    <label><span className={labelClass}>Délai</span><input className={inputClass} name="delay" defaultValue={pack.delay} maxLength={80} required /></label>
                    <label><span className={labelClass}>Ordre d’affichage</span><input className={inputClass} name="sortOrder" type="number" min="0" max="9999" defaultValue={pack.sortOrder} required /></label>
                    <fieldset className="flex flex-wrap items-end gap-x-5 gap-y-3 pb-2">
                      <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" name="isActive" defaultChecked={pack.isActive} className="h-5 w-5 accent-[#f4b400]" /> Visible</label>
                      <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" name="popular" defaultChecked={pack.popular} className="h-5 w-5 accent-[#f4b400]" /> Populaire</label>
                      <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" name="quote" defaultChecked={pack.quote} className="h-5 w-5 accent-[#f4b400]" /> Sur devis</label>
                    </fieldset>
                    <label className="sm:col-span-2">
                      <span className={labelClass}>Avantages, un par ligne</span>
                      <textarea className={inputClass} name="benefits" defaultValue={pack.benefits.join("\n")} rows={5} maxLength={1200} required />
                    </label>
                    <div className="sm:col-span-2"><PendingSubmitButton idleLabel="Enregistrer le pack" className={submitClass} /></div>
                  </form>
                </details>
              </article>
            ))}
          </div>
        </section>

        <section id="services-admin" className={`py-6 ${activeTab === "services" ? "" : "hidden"}`}>
          <p className="flex items-center gap-2 text-sm font-black uppercase text-gold"><SlidersHorizontal size={17} /> Présentation</p>
          <h2 className="mt-2 text-2xl font-black">Services proposés</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {catalog.services.map((service) => (
              <article key={service.id} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-black">{service.title}</h3><p className="mt-1 text-xs font-semibold text-neutral-500">Ordre {service.sortOrder}</p></div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${service.isActive ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{service.isActive ? "Visible" : "Masqué"}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{service.description}</p>
                <details className="group mt-4 border-t border-ink/8 pt-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-black"><Pencil size={16} /> Modifier</summary>
                  <form action={updateServiceAction} className="mt-4 grid gap-4">
                    <input type="hidden" name="id" value={service.id} />
                    <label><span className={labelClass}>Nom</span><input className={inputClass} name="title" defaultValue={service.title} maxLength={100} required /></label>
                    <label><span className={labelClass}>Description</span><textarea className={inputClass} name="description" defaultValue={service.description} rows={4} maxLength={320} required /></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label><span className={labelClass}>Icône</span><select className={inputClass} name="icon" defaultValue={service.icon}>{iconOptions.map((icon) => <option key={icon.value} value={icon.value}>{icon.label}</option>)}</select></label>
                      <label><span className={labelClass}>Ordre</span><input className={inputClass} name="sortOrder" type="number" min="0" max="9999" defaultValue={service.sortOrder} required /></label>
                    </div>
                    <label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" name="isActive" defaultChecked={service.isActive} className="h-5 w-5 accent-[#f4b400]" /> Afficher sur le site</label>
                    <PendingSubmitButton idleLabel="Enregistrer le service" className={submitClass} />
                  </form>
                </details>
              </article>
            ))}
          </div>
        </section>

        <section id="coordonnees-admin" className={`py-6 ${activeTab === "settings" ? "" : "hidden"}`}>
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase text-gold"><Settings2 size={17} /> Paramètres</p>
              <h2 className="mt-2 text-2xl font-black">Coordonnées publiques</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">Ces informations alimentent les boutons d’appel, WhatsApp et les blocs de contact du site.</p>
              <div className="mt-5 flex items-start gap-3 rounded-lg bg-ink p-4 text-white">
                <MapPin className="shrink-0 text-gold" size={20} />
                <div><p className="font-black">{catalog.settings.locationLabel}</p><p className="mt-1 text-sm text-white/65">{catalog.settings.businessHours}</p></div>
              </div>
            </div>
            <form action={updateBusinessSettingsAction} className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5">
              <label><span className={labelClass}>Numéro WhatsApp</span><input className={inputClass} name="whatsappNumber" defaultValue={catalog.settings.whatsappNumber} inputMode="tel" maxLength={20} required /></label>
              <label><span className={labelClass}>Numéro pour les appels</span><input className={inputClass} name="callPhoneNumber" defaultValue={catalog.settings.callPhoneNumber} inputMode="tel" maxLength={20} required /></label>
              <label><span className={labelClass}>Téléphone affiché</span><input className={inputClass} name="displayPhoneNumber" defaultValue={catalog.settings.displayPhoneNumber} maxLength={40} required /></label>
              <label><span className={labelClass}>Adresse email</span><input className={inputClass} name="emailAddress" type="email" defaultValue={catalog.settings.emailAddress} maxLength={160} required /></label>
              <label><span className={labelClass}>Zone principale</span><input className={inputClass} name="locationLabel" defaultValue={catalog.settings.locationLabel} maxLength={120} required /></label>
              <label><span className={labelClass}>Horaires affichés</span><input className={inputClass} name="businessHours" defaultValue={catalog.settings.businessHours} maxLength={160} required /></label>
              <div className="sm:col-span-2"><PendingSubmitButton idleLabel="Enregistrer les coordonnées" className={submitClass} /></div>
            </form>
          </div>
        </section>

        <section id="historique-admin" className={`py-6 ${activeTab === "history" ? "" : "hidden"}`}>
          <p className="flex items-center gap-2 text-sm font-black uppercase text-gold"><History size={17} /> Traçabilité</p>
          <h2 className="mt-2 text-2xl font-black">Dernières modifications</h2>
          {catalog.logs.length ? (
            <div className="mt-5 overflow-hidden rounded-lg border border-ink/10 bg-white">
              {catalog.logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 border-b border-ink/8 px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div><p className="text-sm font-black">{log.summary}</p><p className="mt-1 text-xs font-semibold uppercase text-neutral-500">{log.entityType} · {log.entityId}</p></div>
                  <p className="flex shrink-0 items-center gap-2 text-xs font-semibold text-neutral-500"><Clock3 size={14} /> {new Intl.DateTimeFormat("fr-CD", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lubumbashi" }).format(new Date(log.createdAt))}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-ink/15 p-5 text-sm text-neutral-600">Aucune modification enregistrée pour le moment.</div>
          )}
        </section>
      </div>
    </div>
  );
}
