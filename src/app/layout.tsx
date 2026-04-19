import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { ReminderEngine } from "@/components/ReminderEngine";

export const metadata: Metadata = {
  title: "Helseloggen",
  description: "Offline-først helseapp for seksukerssløyfen",
  applicationName: "Helseloggen"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>
        <ReminderEngine />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
