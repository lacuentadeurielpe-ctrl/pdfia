"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, FileText, Settings, LogOut, Sparkles, Clock
} from "lucide-react";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { href: "/crear",      label: "Crear PDF",    icon: Sparkles },
  { href: "/historial",  label: "Historial",    icon: Clock },
  { href: "/ajustes",    label: "Ajustes",      icon: Settings },
];

interface Props {
  nombreNegocio: string;
  logoUrl: string | null;
  userEmail: string;
}

export default function Sidebar({ nombreNegocio, logoUrl, userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-full flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {/* eslint-disable @next/next/no-img-element */}
          {logoUrl ? (
          <img src={logoUrl} alt="logo" className="w-9 h-9 rounded-lg object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{nombreNegocio}</p>
            <p className="text-gray-500 text-xs">PDFIA</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User / logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-gray-500 text-xs truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                     text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
