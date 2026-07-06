export type IconName =
  | "zap"
  | "package"
  | "fileText"
  | "shirt"
  | "gem"
  | "gift"
  | "heartPulse"
  | "truck"
  | "message"
  | "userCheck"
  | "badgeCheck"
  | "mapPin";

export type Service = {
  title: string;
  description: string;
  icon: IconName;
};

export type Pack = {
  name: string;
  idealFor: string;
  price: string;
  delay: string;
  benefits: string[];
  popular?: boolean;
  quote?: boolean;
};

export type Step = {
  title: string;
  description: string;
  icon: IconName;
};

export type AssistantNeed = {
  id: string;
  label: string;
  description: string;
  service: string;
  packName: string;
};

export type AssistantOption = {
  id: string;
  label: string;
  description: string;
};

export type Rule = {
  title: string;
  description: string;
};

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Nos Packs", href: "#packs" },
  { label: "Commander", href: "#commande" },
  { label: "Suivi", href: "#suivi" },
  { label: "Avis", href: "#avis" },
  { label: "Reglement", href: "#reglement" },
  { label: "Contact", href: "#contact" },
];

export const stats = [
  { value: "500+", label: "livraisons realisees" },
  { value: "30 min", label: "delai express moyen" },
  { value: "100%", label: "suivi de commande" },
];

export const assistantNeeds: AssistantNeed[] = [
  {
    id: "food",
    label: "Repas ou course urgente",
    description: "Repas chaud, petit colis rapide, document a envoyer vite.",
    service: "Livraison Express",
    packName: "Pack Flash",
  },
  {
    id: "commerce",
    label: "Commande boutique",
    description: "E-commerce, vetement, accessoire ou petit colis client.",
    service: "Mode & Textiles",
    packName: "Pack Pro",
  },
  {
    id: "health",
    label: "Sante ou pharmacie",
    description: "Medicaments, documents medicaux ou course laboratoire.",
    service: "Livraison Sante",
    packName: "Pack Sante",
  },
  {
    id: "cargo",
    label: "Colis lourd ou volumineux",
    description: "Marchandise de 5 a 20 kg ou colis qui demande coordination.",
    service: "Cargo & Interurbain",
    packName: "Pack Cargo",
  },
  {
    id: "intercity",
    label: "Trajet interurbain",
    description: "Course vers Kipushi, Likasi, Kasumbalesa ou zone eloignee.",
    service: "Cargo & Interurbain",
    packName: "Pack Inter 70KM",
  },
];

export const urgencyOptions: AssistantOption[] = [
  {
    id: "express",
    label: "Le plus vite possible",
    description: "Priorite au delai et a la confirmation rapide.",
  },
  {
    id: "today",
    label: "Aujourd'hui",
    description: "Course flexible mais a organiser dans la journee.",
  },
  {
    id: "quote",
    label: "Sur devis",
    description: "Besoin de coordination avant confirmation.",
  },
];

export const packageTypeOptions = [
  "Repas",
  "Document",
  "Medicaments",
  "Vetements / Accessoires",
  "Bijou / Objet de valeur",
  "Colis 5-20 kg",
  "Cadeau",
  "Autre",
];

export const services: Service[] = [
  {
    title: "Livraison Express",
    description: "Delai reduit pour urgences, repas, documents et petits colis.",
    icon: "zap",
  },
  {
    title: "Livraison Standard",
    description: "Envois fiables dans un delai souple pour vos besoins quotidiens.",
    icon: "package",
  },
  {
    title: "Documents & Courrier",
    description: "Envoi securise de factures, contrats, courriers et documents administratifs.",
    icon: "fileText",
  },
  {
    title: "Mode & Textiles",
    description: "Livraison pour boutiques, stylistes, vetements, chaussures, sacs et accessoires.",
    icon: "shirt",
  },
  {
    title: "Bijouterie & Horlogerie",
    description: "Service renforce pour bijoux, montres et objets de valeur.",
    icon: "gem",
  },
  {
    title: "Cadeaux & Speciaux",
    description: "Prise en charge de cadeaux, surprises et colis personnalises.",
    icon: "gift",
  },
  {
    title: "Livraison Sante",
    description: "Pharmacies, laboratoires, medicaments et documents medicaux urgents.",
    icon: "heartPulse",
  },
  {
    title: "Cargo & Interurbain",
    description: "Colis de 5 a 20 kg et trajets vers Kipushi, Likasi ou Kasumbalesa.",
    icon: "truck",
  },
];

export const packs: Pack[] = [
  {
    name: "Pack Flash",
    idealFor: "restaurants et repas",
    price: "Des 7 500 FC",
    delay: "30-50 min",
    benefits: ["Livraison ultra-rapide", "Ideal repas chauds", "Confirmation photo", "Support WhatsApp"],
  },
  {
    name: "Pack Pro",
    idealFor: "e-commerce et boutiques",
    price: "Des 6 500 FC",
    delay: "1-3h",
    benefits: [
      "Petits colis e-commerce",
      "Suivi de livraison",
      "Accuse de reception",
      "Photo de confirmation",
      "Support WhatsApp prioritaire",
    ],
    popular: true,
  },
  {
    name: "Pack Sante",
    idealFor: "pharmacies et laboratoires",
    price: "Des 7 000 FC",
    delay: "30-60 min",
    benefits: ["Medicaments et documents", "Prise en charge urgente", "Livraison securisee", "Support WhatsApp"],
  },
  {
    name: "Pack Cargo",
    idealFor: "colis lourds de 5 a 20 kg",
    price: "Devis sur demande",
    delay: "Sur devis",
    benefits: ["Colis jusqu'a 20 kg", "Marchandises volumineuses", "Coordination personnalisee", "Suivi GPS"],
    quote: true,
  },
  {
    name: "Pack Inter 70KM",
    idealFor: "Kipushi, Likasi, Kasumbalesa",
    price: "Tarif selon destination",
    delay: "Delai selon destination",
    benefits: ["Livraison interurbaine", "Planning coordonne", "Devis rapide", "Support WhatsApp"],
    quote: true,
  },
];

export const steps: Step[] = [
  {
    title: "Remplissez le formulaire",
    description: "Indiquez votre nom, numero, type de livraison, lieu de ramassage et destination.",
    icon: "fileText",
  },
  {
    title: "Message WhatsApp auto-genere",
    description: "Le site genere un message clair et structure a envoyer sur WhatsApp.",
    icon: "message",
  },
  {
    title: "Un livreur prend en charge",
    description: "L'equipe confirme la demande et organise la course.",
    icon: "userCheck",
  },
  {
    title: "Livraison confirmee",
    description: "Le client recoit une confirmation avec preuve ou suivi selon le service.",
    icon: "badgeCheck",
  },
];

export const trustArguments = [
  "Respect des delais",
  "Support WhatsApp",
  "Suivi GPS",
  "Photo de livraison",
  "Livraison securisee",
  "Service professionnel",
];

export const paymentRules: Rule[] = [
  {
    title: "Paiement avant reservation",
    description: "La course est confirmee apres paiement ou validation de la preuve de paiement, pas apres livraison.",
  },
  {
    title: "Confirmation par WhatsApp",
    description: "L'equipe confirme le tarif, le delai, le livreur et les conditions avant le depart.",
  },
  {
    title: "Preuve et suivi",
    description: "Selon le service, le client recoit une confirmation, une photo ou un suivi de livraison.",
  },
  {
    title: "Tarifs confirmes avant depart",
    description: "Les prix affiches sont indicatifs. Les cas particuliers sont confirmes avant reservation.",
  },
];

export const sampleReviews = [
  {
    name: "Client restaurant",
    rating: 5,
    comment: "Livraison rapide et communication claire sur WhatsApp.",
  },
  {
    name: "Boutique locale",
    rating: 5,
    comment: "Le suivi et la confirmation photo rassurent nos clients.",
  },
  {
    name: "Client pharmacie",
    rating: 4,
    comment: "Service utile pour les courses urgentes et documents medicaux.",
  },
];
