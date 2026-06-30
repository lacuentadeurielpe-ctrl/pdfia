"use client";
import { useState } from "react";
import { Check, Zap, Crown, Building2, Loader2 } from "lucide-react";
import { PLANES, type PlanId } from "@/lib/planes/config";

const ICONOS: Record<PlanId, React.ElementType> = {
  gratis:  Zap,
  creador: Crown,
  estudio: Building2,
};

const COLORES: Record<PlanId, { ring: string; badge: string; btn: string; icon: string }> = {
  gratis:  { ring: "border-gray-700",   badge: "bg-gray-800 text-gray-300",        btn: "bg-gray-700 hover:bg-gray-600",     icon: "text-gray-400"   },
  creador: { ring: "border-purple-500", badge: "bg-purple-600/20 text-purple-300", btn: "bg-purple-600 hover:bg-purple-500", icon: "text-purple-400" },
  estudio: { ring: "border-amber-500",  badge: "bg-amber-600/20 text-amber-300",   btn: "bg-amber-500  hover:bg-amber-400",  icon: "text-amber-400"  },
};

// Subtítulo de marketing que aparece debajo del precio
const TAGLINES: Record<PlanId, string> = {
  gratis:  "Para explorar y descubrir",
  creador: "Para crear y vender",
  estudio: "Para producir a escala",
};

const FEATURES: Record<PlanId, string[]> = {
  gratis: [
    `Hasta ${PLANES.gratis.externos.ebooksSinImagen} ebooks al mes — siempre gratis`,
    "2 plantillas de diseño incluidas",
    "Ebooks de hasta 5 capítulos",
    "Licencia comercial incluida",
    "Historial de los últimos 7 días",
    "Soporte de la comunidad",
  ],
  creador: [
    `Hasta ${PLANES.creador.externos.ebooksSinImagen} ebooks al mes`,
    `Hasta ${PLANES.creador.externos.ebooksConImagen} ebooks al mes con imágenes IA`,
    "Las 8 plantillas premium desbloqueadas",
    "Imágenes IA originales por capítulo",
    "100% tu marca — sin sello de terceros",
    "Tu logo, colores e identidad visual",
    "Ebooks de hasta 12 capítulos",
    "Historial y descargas ilimitadas",
    "Licencia comercial incluida",
  ],
  estudio: [
    `Hasta ${PLANES.estudio.externos.ebooksSinImagen} ebooks al mes`,
    `Hasta ${PLANES.estudio.externos.ebooksConImagen} ebooks al mes con imágenes Pro`,
    "Todo lo del plan Creador, más:",
    "Imágenes Premium (Gemini Pro — máxima calidad)",
    "Redacción Ultra-Densa (Claude Opus)",
    "Ebooks de hasta 15 capítulos",
    "Soporte dedicado con respuesta rápida",
    "Licencia comercial incluida",
  ],
};

interface Props {
  planActual: PlanId;
}

const ORDEN: PlanId[] = ["gratis", "creador", "estudio"];

export default function PlanesCards({ planActual }: Props) {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError]   = useState("");

  async function handleUpgrade(planId: PlanId) {
    setError("");
    setLoading(planId);
    try {
      const res = await fetch("/api/pagos/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar pago");
      // Redirigir al checkout de MercadoPago
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(null);
    }
  }

  const indexActual = ORDEN.indexOf(planActual);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ORDEN.map((planId) => {
          const plan      = PLANES[planId];
          const colores   = COLORES[planId];
          const Icon      = ICONOS[planId];
          const features  = FEATURES[planId];
          const esCurrent = planId === planActual;
          const esMenor   = ORDEN.indexOf(planId) < indexActual;
          const isLoading = loading === planId;

          return (
            <div
              key={planId}
              className={`relative bg-gray-900 rounded-2xl border-2 p-6 flex flex-col ${colores.ring} ${
                esCurrent ? "ring-2 ring-offset-2 ring-offset-gray-950" : ""
              }`}
              style={esCurrent ? { "--tw-ring-color": "currentColor" } as React.CSSProperties : {}}
            >
              {esCurrent && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold ${colores.badge}`}>
                  Plan actual
                </div>
              )}
              {planId === "creador" && !esCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-600/20 text-purple-300">
                  Más popular
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${colores.icon}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{plan.nombre}</h3>
                    <p className="text-xs text-gray-500">{TAGLINES[planId]}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  {plan.precioSoles === 0 ? (
                    <span className="text-3xl font-black text-white">Gratis</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-white">S/ {plan.precioSoles}</span>
                      <span className="text-gray-500 text-sm">/mes</span>
                    </>
                  )}
                </div>
                {/* Métrica hero — el número más impactante del plan */}
                <div className={`mt-3 rounded-xl px-3 py-2 text-center border ${
                  planId === "gratis" ? "bg-gray-800/50 border-gray-700"
                  : planId === "creador" ? "bg-purple-600/10 border-purple-500/30"
                  : "bg-amber-600/10 border-amber-500/30"
                }`}>
                  <span className={`text-2xl font-black ${colores.icon}`}>
                    {plan.externos.ebooksSinImagen.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-xs ml-1">ebooks/mes posibles</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colores.icon}`} />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Botón */}
              {esCurrent ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-gray-800 text-gray-400">
                  Plan activo
                </div>
              ) : esMenor ? (
                <div className="w-full py-2.5 rounded-xl text-center text-sm text-gray-600 bg-gray-800/30 border border-gray-800">
                  Ya incluido en tu plan
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(planId)}
                  disabled={!!loading}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed ${colores.btn} flex items-center justify-center gap-2`}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Redirigiendo..." : `Cambiar a ${plan.nombre}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 text-center pt-2">
        Pago seguro vía MercadoPago · Los créditos se renuevan mensualmente · Cancela cuando quieras
      </p>
    </div>
  );
}
