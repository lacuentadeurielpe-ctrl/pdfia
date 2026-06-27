"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FoxLogo } from "./FoxLogo";

const LINKS = [
  { href: "/#caracteristicas", label: "Características" },
  { href: "/#como-funciona",   label: "Cómo funciona" },
  { href: "/#precios",         label: "Precios" },
  { href: "/nosotros",         label: "Nosotros" },
  { href: "/contacto",         label: "Contacto" },
];

export default function Navbar({ isAuth = false }: { isAuth?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-950/80 border-b border-gray-800/60">
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <FoxLogo className="w-9 h-9 transition-transform group-hover:scale-105" />
          <span className="text-xl font-extrabold text-white tracking-tight">
            Fox<span className="text-orange-500">PDF</span>
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isAuth ? (
            <Link href="/dashboard"
              className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Ir al panel
            </Link>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-gray-200 hover:text-white font-medium px-4 py-2.5 transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/registro"
                className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-600/20">
                Empezar gratis
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-200" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-800/60 bg-gray-950 px-5 py-4 space-y-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-gray-300 hover:text-white text-sm font-medium">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {isAuth ? (
              <Link href="/dashboard" className="bg-orange-600 text-white text-center text-sm font-semibold px-5 py-2.5 rounded-xl">
                Ir al panel
              </Link>
            ) : (
              <>
                <Link href="/login" className="border border-gray-700 text-white text-center text-sm font-semibold px-5 py-2.5 rounded-xl">
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="bg-orange-600 text-white text-center text-sm font-semibold px-5 py-2.5 rounded-xl">
                  Empezar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
