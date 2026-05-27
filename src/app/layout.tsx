import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ReminderEngine } from "@/components/ReminderEngine";
import { ServiceWorkerCleanup } from "@/components/ServiceWorkerCleanup";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { LanguagePrompt } from "@/i18n/LanguagePrompt";

export const metadata: Metadata = {
  title: "Helseloggen / Leader Health Loop",
  description: "Offline-først helseapp for seksukerssløyfen / Offline-first health app for the 6-week loop",
  applicationName: "Helseloggen / Leader Health Loop",
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
    <html lang="no" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <LanguagePrompt />
          <ServiceWorkerCleanup />
          <ReminderEngine />
          <Nav />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
