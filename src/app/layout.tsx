import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Tejarify — Drop 01", description: "Ashfall collection by Tejarify." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
