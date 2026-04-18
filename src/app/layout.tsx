import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { PwaRegister } from "@/components/PwaRegister";
import { ReminderEngine } from "@/components/ReminderEngine";

export const metadata: Metadata = {
  title: "Health tracker",
  description: "Offline-first 6-week health loop tracker",
  applicationName: "Health tracker"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <ReminderEngine />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
