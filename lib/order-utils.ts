export function createInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MRD-${date}-${random}`;
}

export function createTrackingCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MRD-${random}`;
}
