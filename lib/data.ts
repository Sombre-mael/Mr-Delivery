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
  id: string;
  title: string;
  description: string;
  icon: IconName;
  isActive?: boolean;
  sortOrder?: number;
};

export type Pack = {
  id: string;
  name: string;
  idealFor: string;
  price: string;
  delay: string;
  benefits: string[];
  popular?: boolean;
  quote?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export type BusinessSettings = {
  whatsappNumber: string;
  callPhoneNumber: string;
  displayPhoneNumber: string;
  emailAddress: string;
  locationLabel: string;
  businessHours: string;
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
  serviceId: string;
  packName: string;
  packId: string;
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
  { label: "Règlement", href: "#reglement" },
  { label: "Contact", href: "#contact" },
];

export const stats = [
  { value: "500+", label: "livraisons réalisées" },
  { value: "30 min", label: "délai express moyen" },
  { value: "100%", label: "suivi de commande" },
];

export const assistantNeeds: AssistantNeed[] = [
  {
    id: "food",
    label: "Repas ou course urgente",
    description: "Repas chaud, petit colis rapide, document à envoyer vite.",
    service: "Livraison Express",
    serviceId: "livraison-express",
    packName: "Pack Flash",
    packId: "pack-flash",
  },
  {
    id: "commerce",
    label: "Commande boutique",
    description: "E-commerce, vêtement, accessoire ou petit colis client.",
    service: "Mode & Textiles",
    serviceId: "mode-textiles",
    packName: "Pack Pro",
    packId: "pack-pro",
  },
  {
    id: "health",
    label: "Santé ou pharmacie",
    description: "Médicaments, documents médicaux ou course laboratoire.",
    service: "Livraison Santé",
    serviceId: "livraison-sante",
    packName: "Pack Santé",
    packId: "pack-sante",
  },
  {
    id: "cargo",
    label: "Colis lourd ou volumineux",
    description: "Marchandise de 5 à 20 kg ou colis qui demande coordination.",
    service: "Cargo & Interurbain",
    serviceId: "cargo-interurbain",
    packName: "Pack Cargo",
    packId: "pack-cargo",
  },
  {
    id: "intercity",
    label: "Trajet interurbain",
    description: "Course vers Kipushi, Likasi, Kasumbalesa ou zone éloignée.",
    service: "Cargo & Interurbain",
    serviceId: "cargo-interurbain",
    packName: "Pack Inter 70KM",
    packId: "pack-inter-70km",
  },
];

export const urgencyOptions: AssistantOption[] = [
  {
    id: "express",
    label: "Le plus vite possible",
    description: "Priorité au délai et à la confirmation rapide.",
  },
  {
    id: "today",
    label: "Aujourd'hui",
    description: "Course flexible mais à organiser dans la journée.",
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
  "Médicaments",
  "Vêtements / Accessoires",
  "Bijou / Objet de valeur",
  "Colis 5-20 kg",
  "Cadeau",
  "Autre",
];

export const services: Service[] = [
  {
    id: "livraison-express",
    title: "Livraison Express",
    description: "Délai réduit pour urgences, repas, documents et petits colis.",
    icon: "zap",
  },
  {
    id: "livraison-standard",
    title: "Livraison Standard",
    description: "Envois fiables dans un délai souple pour vos besoins quotidiens.",
    icon: "package",
  },
  {
    id: "documents-courrier",
    title: "Documents & Courrier",
    description: "Envoi sécurisé de factures, contrats, courriers et documents administratifs.",
    icon: "fileText",
  },
  {
    id: "mode-textiles",
    title: "Mode & Textiles",
    description: "Livraison pour boutiques, stylistes, vêtements, chaussures, sacs et accessoires.",
    icon: "shirt",
  },
  {
    id: "bijouterie-horlogerie",
    title: "Bijouterie & Horlogerie",
    description: "Service renforce pour bijoux, montres et objets de valeur.",
    icon: "gem",
  },
  {
    id: "cadeaux-speciaux",
    title: "Cadeaux & Spéciaux",
    description: "Prise en charge de cadeaux, surprises et colis personnalisés.",
    icon: "gift",
  },
  {
    id: "livraison-sante",
    title: "Livraison Santé",
    description: "Pharmacies, laboratoires, médicaments et documents médicaux urgents.",
    icon: "heartPulse",
  },
  {
    id: "cargo-interurbain",
    title: "Cargo & Interurbain",
    description: "Colis de 5 à 20 kg et trajets vers Kipushi, Likasi ou Kasumbalesa.",
    icon: "truck",
  },
];

export const packs: Pack[] = [
  {
    id: "pack-flash",
    name: "Pack Flash",
    idealFor: "restaurants et repas",
    price: "Dès 7 500 FC",
    delay: "30-50 min",
    benefits: ["Livraison ultra-rapide", "Idéal repas chauds", "Confirmation photo", "Support WhatsApp"],
  },
  {
    id: "pack-pro",
    name: "Pack Pro",
    idealFor: "e-commerce et boutiques",
    price: "Dès 6 500 FC",
    delay: "1-3h",
    benefits: [
      "Petits colis e-commerce",
      "Suivi de livraison",
      "Accusé de réception",
      "Photo de confirmation",
      "Support WhatsApp prioritaire",
    ],
    popular: true,
  },
  {
    id: "pack-sante",
    name: "Pack Santé",
    idealFor: "pharmacies et laboratoires",
    price: "Dès 7 000 FC",
    delay: "30-60 min",
    benefits: ["Médicaments et documents", "Prise en charge urgente", "Livraison sécurisée", "Support WhatsApp"],
  },
  {
    id: "pack-cargo",
    name: "Pack Cargo",
    idealFor: "colis lourds de 5 a 20 kg",
    price: "Devis sur demande",
    delay: "Sur devis",
    benefits: ["Colis jusqu'à 20 kg", "Marchandises volumineuses", "Coordination personnalisée", "Suivi GPS"],
    quote: true,
  },
  {
    id: "pack-inter-70km",
    name: "Pack Inter 70KM",
    idealFor: "Kipushi, Likasi, Kasumbalesa",
    price: "Tarif selon destination",
    delay: "Délai selon destination",
    benefits: ["Livraison interurbaine", "Planning coordonné", "Devis rapide", "Support WhatsApp"],
    quote: true,
  },
];

export const defaultBusinessSettings: BusinessSettings = {
  whatsappNumber: "243819428849",
  callPhoneNumber: "243819428849",
  displayPhoneNumber: "+243 819 428 849",
  emailAddress: "mrdelivery004@gmail.com",
  locationLabel: "Lubumbashi, RDC",
  businessHours: "Disponible 7j/7 dès 7h00",
};

export const steps: Step[] = [
  {
    title: "Remplissez le formulaire",
    description: "Indiquez votre nom, numéro, type de livraison, lieu de ramassage et destination.",
    icon: "fileText",
  },
  {
    title: "Message WhatsApp auto-généré",
    description: "Le site génère un message clair et structuré à envoyer sur WhatsApp.",
    icon: "message",
  },
  {
    title: "Un livreur prend en charge",
    description: "L'équipe confirme la demande et organise la course.",
    icon: "userCheck",
  },
  {
    title: "Livraison confirmée",
    description: "Le client reçoit une confirmation avec preuve ou suivi selon le service.",
    icon: "badgeCheck",
  },
];

export const trustArguments = [
  "Respect des délais",
  "Support WhatsApp",
  "Suivi GPS",
  "Photo de livraison",
  "Livraison sécurisée",
  "Service professionnel",
];

export const paymentRules: Rule[] = [
  {
    title: "Paiement avant réservation",
    description: "La course est confirmée après paiement ou validation de la preuve de paiement, pas après livraison.",
  },
  {
    title: "Confirmation par WhatsApp",
    description: "L'équipe confirme le tarif, le délai, le livreur et les conditions avant le départ.",
  },
  {
    title: "Preuve et suivi",
    description: "Selon le service, le client reçoit une confirmation, une photo ou un suivi de livraison.",
  },
  {
    title: "Tarifs confirmés avant départ",
    description: "Les prix affichés sont indicatifs. Les cas particuliers sont confirmés avant réservation.",
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
    comment: "Service utile pour les courses urgentes et documents médicaux.",
  },
];
