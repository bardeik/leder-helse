import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ReminderEngine } from "@/components/ReminderEngine";
import { ServiceWorkerCleanup } from "@/components/ServiceWorkerCleanup";

export const metadata: Metadata = {
  title: "Helseloggen",
  description: "Offline-først helseapp for seksukerssløyfen",
  applicationName: "Helseloggen",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>
        <ServiceWorkerCleanup />
        <ReminderEngine />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
