import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Health tracker",
    short_name: "Health tracker",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#24595a",
    description: "Offline-first 6-week health loop tracking app"
  };
}
