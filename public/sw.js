const APP_NAME = "Mr. Delivery";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || APP_NAME, {
      body: data.body || "Votre livraison a ete mise a jour.",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: data.tag || "mr-delivery-status",
      renotify: true,
      data: { url: data.url || "/track" },
      actions: [{ action: "open", title: "Voir le suivi" }],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/track", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => client.url === targetUrl);
      return matchingClient ? matchingClient.focus() : self.clients.openWindow(targetUrl);
    }),
  );
});
