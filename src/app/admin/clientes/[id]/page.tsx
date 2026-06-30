"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Infinity as InfinityIcon, Gift, Crown, FileText, CreditCard, History, Check } from "lucide-react";

interface Detalle {
  usuario: { id: string; email: string; nombre: string; negocio: string; creadoEl: string; ultimoLogin: string | null; confirmado: boolean };
  suscripcion: { plan: string; creditos_totales: number; creditos_usados: number; ciclo_fin: string; ilimitado: boolean; origen: string } | null;
  planNombre: string;
  ebooks: { id: string; titulo: string; created_at: string }[];
  pagos: { id: string; plan_id: string; monto_soles: number; estado: string; created_at: string }[];
  acciones: { accion: string; detalle: Record<string, unknown>; created_at: string }[];
}

const PLANES = [
  { id: "gratis", label: "Gratis" },
  { id: "creador", label: "Creador" },
  { id: "estudio", label: "Estudio" },
];

function fecha(s: string | null) { return s ? new Date(s).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "—"; }

export default function ClienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<Detalle | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [cantidad, setCantidad] = useState("");

  const cargar = useCallback(() => {
    fetch(`/api/admin/usuario/${id}`).then((r) => r.json()).then(setD);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function accion(body: Record<string, unknown>, okMsg: string) {
    setBusy(true); setMsg("");
    const res = await fetch(`/api/admin/usuario/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) { setMsg(okMsg); cargar(); setCantidad(""); setTimeout(() => setMsg(""), 2500); }
    else { const e = await res.json(); setMsg(e.error ?? "Error"); }
  }

  if (!d) return <div className="p-8 text-gray-600">Cargando…</div>;

  const sub = d.suscripcion;
  const ilimitado = sub?.ilimitado ?? false;
  const disp = ilimitado ? "∞" : Math.max(0, (sub?.creditos_totales ?? 0) - (sub?.creditos_usados ?? 0));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a clientes
      </Link>

      {/* Cabecera */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white">{d.usuario.nombre || d.usuario.email}</h1>
            <p className="text-gray-500 text-sm">{d.usuario.email}</p>
            {d.usuario.negocio && <p className="text-gray-600 text-xs mt-0.5">Negocio: {d.usuario.negocio}</p>}
          </div>
          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <div>Registro: {fecha(d.usuario.creadoEl)}</div>
            <div>Último acceso: {fecha(d.usuario.ultimoLogin)}</div>
            <div>{d.usuario.confirmado ? <span className="text-emerald-400">✓ Confirmado</span> : <span className="text-amber-400">Sin confirmar</span>}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-gray-800/50 rounded-xl p-3">
            <div className="text-xs text-gray-500">Plan</div>
            <div className={`text-sm font-bold ${ilimitado ? "text-amber-300" : "text-white"}`}>{ilimitado ? "Ilimitado" : d.planNombre}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-3">
            <div className="text-xs text-gray-500">Créditos disp.</div>
            <div className="text-sm font-bold text-white">{disp}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-3">
            <div className="text-xs text-gray-500">Origen</div>
            <div className="text-sm font-bold text-gray-300 capitalize">{sub?.origen ?? "auto"}</div>
          </div>
        </div>
      </div>

      {msg && <div className="mb-5 bg-indigo-950/60 border border-indigo-800 rounded-xl px-4 py-2.5 text-indigo-300 text-sm flex items-center gap-2"><Check className="w-4 h-4" />{msg}</div>}

      {/* Acciones */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Ilimitado */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1"><InfinityIcon className="w-4 h-4 text-amber-400" /><h3 className="text-white font-semibold text-sm">Plan ilimitado</h3></div>
          <p className="text-gray-500 text-xs mb-4">Créditos infinitos y todas las funciones premium.</p>
          <button disabled={busy} onClick={() => accion({ accion: "ilimitado", valor: !ilimitado }, ilimitado ? "Ilimitado desactivado" : "¡Ilimitado activado!")}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
              ilimitado ? "bg-red-600/20 text-red-300 hover:bg-red-600/30" : "bg-amber-500 text-gray-900 hover:bg-amber-400"
            }`}>
            {ilimitado ? "Quitar ilimitado" : "Activar ilimitado"}
          </button>
        </div>

        {/* Créditos */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1"><Gift className="w-4 h-4 text-emerald-400" /><h3 className="text-white font-semibold text-sm">Créditos</h3></div>
          <p className="text-gray-500 text-xs mb-4">Suma de regalo o fija un total exacto.</p>
          <input type="number" min={0} value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Cantidad"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-indigo-500" />
          <div className="flex gap-2">
            <button disabled={busy || !cantidad} onClick={() => accion({ accion: "creditos", modo: "sumar", cantidad }, `+${cantidad} créditos regalados`)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40">+ Sumar</button>
            <button disabled={busy || !cantidad} onClick={() => accion({ accion: "creditos", modo: "fijar", cantidad }, `Créditos fijados en ${cantidad}`)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-40">Fijar total</button>
          </div>
        </div>
      </div>

      {/* Cambiar plan */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-1"><Crown className="w-4 h-4 text-violet-400" /><h3 className="text-white font-semibold text-sm">Cambiar plan</h3></div>
        <p className="text-gray-500 text-xs mb-4">Asigna un plan sin pasar por MercadoPago (resetea el ciclo de créditos).</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PLANES.map((p) => (
            <button key={p.id} disabled={busy} onClick={() => accion({ accion: "plan", plan: p.id }, `Plan cambiado a ${p.label}`)}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                sub?.plan === p.id && !ilimitado ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Historiales */}
      <div className="grid md:grid-cols-3 gap-5">
        <Panel icon={FileText} titulo={`Ebooks (${d.ebooks.length})`}>
          {d.ebooks.length === 0 ? <Vacio /> : d.ebooks.slice(0, 8).map((e) => (
            <Fila key={e.id} a={e.titulo || "Sin título"} b={fecha(e.created_at)} />
          ))}
        </Panel>
        <Panel icon={CreditCard} titulo={`Pagos (${d.pagos.length})`}>
          {d.pagos.length === 0 ? <Vacio /> : d.pagos.map((p) => (
            <Fila key={p.id} a={`S/ ${Number(p.monto_soles).toFixed(2)}`} b={p.estado} />
          ))}
        </Panel>
        <Panel icon={History} titulo="Auditoría">
          {d.acciones.length === 0 ? <Vacio /> : d.acciones.map((a, i) => (
            <Fila key={i} a={a.accion.replace(/_/g, " ")} b={fecha(a.created_at)} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, titulo, children }: { icon: React.ElementType; titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3"><Icon className="w-3.5 h-3.5 text-gray-500" /><h4 className="text-gray-300 text-xs font-semibold">{titulo}</h4></div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Fila({ a, b }: { a: string; b: string }) {
  return <div className="flex justify-between gap-2 text-xs"><span className="text-gray-400 truncate">{a}</span><span className="text-gray-600 flex-shrink-0 capitalize">{b}</span></div>;
}
function Vacio() { return <div className="text-gray-700 text-xs">Nada aún.</div>; }
