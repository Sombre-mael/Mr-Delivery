"use client";

import { useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Star } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { sampleReviews } from "@/lib/data";
import { generateReviewMessage, generateWhatsAppLink } from "@/lib/whatsapp";

export function Reviews() {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const reviewLink = useMemo(
    () => generateWhatsAppLink(generateReviewMessage({ name, rating, comment })),
    [comment, name, rating],
  );

  return (
    <section id="avis" data-nav-theme="light" className="bg-[#fff7df] px-4 py-16 text-ink sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <GsapReveal>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Avis clients</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Votre retour aide à améliorer le service
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-700">
              Les avis envoyés ici partent sur WhatsApp pour validation manuelle. Ils ne sont pas publiés
              automatiquement sur le site.
            </p>

            <div className="mt-7 grid gap-3">
              {sampleReviews.map((review) => (
                <article key={review.name} className="rounded-lg border border-ink/8 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-ink">{review.name}</h3>
                    <div className="flex text-gold">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} size={15} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{review.comment}</p>
                </article>
              ))}
            </div>
          </div>
        </GsapReveal>

        <GsapReveal>
          <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-soft sm:p-6">
            <h3 className="text-2xl font-black text-ink">Noter Mr. Delivery</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Choisissez une note, ajoutez un commentaire, puis envoyez votre avis via WhatsApp.
            </p>

            <div className="mt-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Votre note</p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      value <= rating ? "border-gold bg-gold text-ink" : "border-ink/10 bg-[#fffdf7] text-neutral-400"
                    }`}
                    aria-label={`Donner ${value} étoile${value > 1 ? "s" : ""}`}
                  >
                    <Star size={19} fill={value <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Nom optionnel</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Votre nom"
                className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Commentaire</span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Dites-nous comment s'est passée votre expérience."
                rows={5}
                className="mt-2 w-full resize-none rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
              />
            </label>

            <div className="mt-5 rounded-lg border border-ink/8 bg-ink p-4 text-white">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-gold">
                <MessageCircle size={16} />
                Aperçu WhatsApp
              </p>
              <p className="mt-3 text-sm leading-6 text-white/72">
                Note {rating}/5 - {name || "Client"} - {comment || "Aucun commentaire ajouté"}
              </p>
            </div>

            <a
              href={reviewLink}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-black text-ink shadow-gold transition hover:-translate-y-0.5 hover:bg-ink hover:text-white"
            >
              Envoyer mon avis sur WhatsApp
              <ArrowRight size={18} />
            </a>
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}
