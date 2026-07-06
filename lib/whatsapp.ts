export const WHATSAPP_NUMBER = "243819428849";
export const DISPLAY_PHONE_NUMBER = "+243 819 428 849";
export const PHONE_LINK = "tel:+243819428849";

export type DeliveryStatus =
  | "payment_pending"
  | "payment_confirmed"
  | "picked_up"
  | "in_delivery"
  | "delivered"
  | "issue";

export type StatusMessageInput = {
  customerName?: string;
  customerPhone?: string;
  invoiceNumber?: string;
  packName?: string;
  amount?: string;
  paymentStatus?: string;
  pickup?: string;
  destination?: string;
  notes?: string;
  status: DeliveryStatus;
};

export type OrderMessageInput = {
  name?: string;
  phone?: string;
  service?: string;
  need?: string;
  urgency?: string;
  pickup?: string;
  destination?: string;
  pickupMapUrl?: string;
  destinationMapUrl?: string;
  packageType?: string;
  details?: string;
  packName?: string;
};

export type ReviewMessageInput = {
  name?: string;
  rating: number;
  comment?: string;
};

export type TrackingSupportMessageInput = {
  trackingCode?: string;
  invoiceNumber?: string;
  statusLabel?: string;
  pickup?: string;
  destination?: string;
};

export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  payment_pending: "Paiement attendu",
  payment_confirmed: "Paiement confirme",
  picked_up: "Colis recupere",
  in_delivery: "En cours de livraison",
  delivered: "Livre",
  issue: "Probleme ou retard",
};

export function generateWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function normalizeWhatsAppPhone(phone?: string) {
  const digits = (phone || "").replace(/\D/g, "");

  if (!digits) {
    return WHATSAPP_NUMBER;
  }

  if (digits.startsWith("0")) {
    return `243${digits.slice(1)}`;
  }

  if (digits.startsWith("243")) {
    return digits;
  }

  return digits;
}

export function generateClientWhatsAppLink(phone: string | undefined, message: string) {
  return `https://wa.me/${normalizeWhatsAppPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function generatePackMessage(packName: string) {
  return [
    "NOUVELLE DEMANDE MR. DELIVERY",
    "",
    `Bonjour Mr. Delivery, je suis interesse par le ${packName}.`,
    "Merci de me donner les details pour une livraison a Lubumbashi.",
  ].join("\n");
}

export function generateGeneralOrderMessage() {
  return [
    "NOUVELLE DEMANDE MR. DELIVERY",
    "",
    "Bonjour Mr. Delivery, je souhaite demander une livraison.",
    "",
    "Service souhaite :",
    "Nom :",
    "Telephone :",
    "Lieu de ramassage :",
    "Lieu de livraison :",
    "Type de colis :",
    "Details :",
    "",
    "Merci de me confirmer la disponibilite.",
  ].join("\n");
}

export function generateCustomOrderMessage(order: OrderMessageInput) {
  const selectedPack = order.packName ? `Pack choisi : ${order.packName}` : "Pack choisi : A confirmer";

  return [
    "NOUVELLE DEMANDE MR. DELIVERY",
    "",
    "Bonjour Mr. Delivery, je souhaite demander une livraison.",
    "",
    selectedPack,
    `Service souhaite : ${order.service || "A preciser"}`,
    `Besoin client : ${order.need || "A preciser"}`,
    `Urgence : ${order.urgency || "A preciser"}`,
    `Nom : ${order.name || "A preciser"}`,
    `Telephone : ${order.phone || "A preciser"}`,
    `Lieu de ramassage : ${order.pickup || "A preciser"}`,
    `GPS ramassage : ${order.pickupMapUrl || "Non fourni"}`,
    `Lieu de livraison : ${order.destination || "A preciser"}`,
    `GPS livraison : ${order.destinationMapUrl || "Non fourni"}`,
    `Type de colis : ${order.packageType || "A preciser"}`,
    `Details : ${order.details || "A preciser"}`,
    "",
    "Merci de me confirmer la disponibilite.",
  ].join("\n");
}

export function generateReviewMessage(review: ReviewMessageInput) {
  return [
    "AVIS CLIENT MR. DELIVERY",
    "",
    `Note : ${review.rating}/5`,
    `Nom : ${review.name || "Client"}`,
    `Commentaire : ${review.comment || "Aucun commentaire ajoute"}`,
    "",
    "Merci pour votre service.",
  ].join("\n");
}

export function generateTrackingSupportMessage(input: TrackingSupportMessageInput) {
  return [
    "ASSISTANCE SUIVI MR. DELIVERY",
    "",
    "Bonjour Mr. Delivery, j'ai besoin d'aide concernant mon colis.",
    "",
    `Code suivi : ${input.trackingCode || "A preciser"}`,
    `Facture : ${input.invoiceNumber || "A preciser"}`,
    `Statut actuel : ${input.statusLabel || "A verifier"}`,
    `Ramassage : ${input.pickup || "A confirmer"}`,
    `Livraison : ${input.destination || "A confirmer"}`,
    "",
    "Merci de me donner une mise a jour.",
  ].join("\n");
}

export function generateMapsLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

export function generateStatusMessage(input: StatusMessageInput) {
  const customer = input.customerName || "Cher client";
  const invoice = input.invoiceNumber ? `Facture : ${input.invoiceNumber}` : "Facture : A confirmer";
  const pack = input.packName ? `Pack : ${input.packName}` : "Pack : A confirmer";
  const route = `Trajet : ${input.pickup || "Ramassage a confirmer"} -> ${input.destination || "Destination a confirmer"}`;
  const amount = input.amount ? `Montant : ${input.amount}` : "Montant : A confirmer";
  const payment = input.paymentStatus ? `Paiement : ${input.paymentStatus}` : "Paiement : A confirmer";
  const notes = input.notes ? `Note : ${input.notes}` : "";

  const statusMessage: Record<DeliveryStatus, string> = {
    payment_pending:
      "Votre demande est prete. Merci d'effectuer le paiement pour confirmer la reservation de votre livraison.",
    payment_confirmed:
      "Votre paiement est confirme. Mr. Delivery organise maintenant la prise en charge de votre colis.",
    picked_up: "Votre colis a ete recupere. Nous vous tenons informe de la suite de la livraison.",
    in_delivery: "Votre colis est actuellement en cours de livraison.",
    delivered: "Votre colis a ete livre. Merci d'avoir choisi Mr. Delivery.",
    issue:
      "Nous avons une information importante concernant votre livraison. Notre equipe vous contacte pour clarifier la situation.",
  };

  return [
    `MISE A JOUR MR. DELIVERY - ${deliveryStatusLabels[input.status]}`,
    "",
    `Bonjour ${customer},`,
    statusMessage[input.status],
    "",
    invoice,
    pack,
    amount,
    payment,
    route,
    notes,
    "",
    "Mr. Delivery - Votre temps est precieux, nous le respectons.",
  ]
    .filter(Boolean)
    .join("\n");
}
