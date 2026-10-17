import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudITR Pro — Zero-Error Indian Tax Engine & CA Audit Console",
  description:
    "Deterministic Income Tax Return computation, Section 115BAC regime optimization, quarterly 234C interest scheduling, AIS/26AS reconciliation, and official ITD schema return generation for Chartered Accountants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#080c14] text-[#f1f5f9]">
        {children}
      </body>
    </html>
  );
}
