export const WHATSAPP_NUMBER = "243819428849";
export const DISPLAY_PHONE_NUMBER = "+243 819 428 849";
export const PHONE_LINK = "tel:+243819428849";

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

export function generateWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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

export function generateMapsLink(latitude: number, longitude: number) {
  return `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}
