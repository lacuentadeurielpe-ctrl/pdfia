"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, Users, Gift, CreditCard, ShieldCheck, LogOut, ArrowLeft } from "lucide-react";

const NAV = [
  { href: "/admin",          label: "Resumen",        icon: LayoutDashboard, exact: true },
  { href: "/admin/clientes", label: "Clientes",       icon: Users },
  { href: "/admin/creditos", label: "Créditos masivos", icon: Gift },
  { href: "/admin/pagos",    label: "Pagos y auditoría", icon: CreditCard },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function salir() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">FoxPDF</div>
            <div className="text-indigo-400 text-xs font-semibold">Superadmin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-indigo-600/15 text-indigo-300" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link href="/crear" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          App normal
        </Link>
        <div className="px-3 py-2 text-xs text-gray-600 truncate">{email}</div>
        <button onClick={salir} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
