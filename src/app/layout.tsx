import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://foxpdf.cloud"),
  title: {
    default: "FoxPDF — Crea ebooks y documentos profesionales con IA",
    template: "%s",
  },
  description:
    "FoxPDF genera ebooks, guías y documentos profesionales con inteligencia artificial multi-agente. De una idea a un PDF listo para vender en minutos.",
  keywords: ["ebook", "PDF", "inteligencia artificial", "generador de documentos", "FoxPDF"],
  openGraph: {
    title: "FoxPDF — Crea ebooks y documentos profesionales con IA",
    description: "De una idea a un PDF profesional en minutos, con IA multi-agente.",
    url: "https://foxpdf.cloud",
    siteName: "FoxPDF",
    locale: "es_PE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
