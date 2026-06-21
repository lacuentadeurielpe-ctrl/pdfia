import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDFIA — Creador de PDFs con IA",
  description: "Genera ebooks y documentos profesionales con inteligencia artificial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
