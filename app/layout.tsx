import type { Metadata } from "next";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Delivery Verify",
  description: "Vérification multisignature pour livraisons Amazon de valeur",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
