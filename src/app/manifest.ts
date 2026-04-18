import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Helseloggen",
    short_name: "Helseloggen",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#24595a",
    description: "Offline-først app for seksukers helseoppfølging"
  };
}
