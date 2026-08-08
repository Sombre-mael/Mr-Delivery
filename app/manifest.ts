import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Mr. Delivery",
    short_name: "Mr. Delivery",
    description: "Commandez et suivez vos livraisons Mr. Delivery.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fffdf7",
    theme_color: "#111111",
    orientation: "portrait-primary",
    categories: ["business", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
