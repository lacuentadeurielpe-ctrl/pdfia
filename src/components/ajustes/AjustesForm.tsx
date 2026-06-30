"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Save, Check, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Config {
  id: string;
  nombre_negocio: string;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
  color_acento: string;
  url_negocio: string | null;
  footer_texto: string | null;
}

interface Props {
  config: Config | null;
  userId: string;
  marcaPersonalizada: boolean;
  planNombre: string;
}

const COLORES_PRESET = [
  { name: "Índigo",     primario: "#6366f1", secundario: "#8b5cf6", acento: "#06b6d4" },
  { name: "Esmeralda",  primario: "#10b981", secundario: "#059669", acento: "#f59e0b" },
  { name: "Rosa",       primario: "#ec4899", secundario: "#f43f5e", acento: "#8b5cf6" },
  { name: "Naranja",    primario: "#f97316", secundario: "#ef4444", acento: "#eab308" },
  { name: "Azul",       primario: "#3b82f6", secundario: "#1d4ed8", acento: "#06b6d4" },
  { name: "Pizarra",    primario: "#475569", secundario: "#334155", acento: "#6366f1" },
];

export default function AjustesForm({ config, userId, marcaPersonalizada, planNombre }: Props) {
  const [nombre, setNombre]         = useState(config?.nombre_negocio ?? "");
  const [logoUrl, setLogoUrl]       = useState(config?.logo_url ?? null);
  const [primario, setPrimario]     = useState(config?.color_primario ?? "#6366f1");
  const [secundario, setSecundario] = useState(config?.color_secundario ?? "#8b5cf6");
  const [acento, setAcento]         = useState(config?.color_acento ?? "#06b6d4");
  const [urlNegocio, setUrlNegocio] = useState(config?.url_negocio ?? "");
  const [footerTexto, setFooterTexto] = useState(config?.footer_texto ?? "");
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/logo.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(data.publicUrl + `?t=${Date.now()}`);
    }
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from("configuraciones_negocio").upsert({
      user_id:          userId,
      nombre_negocio:   nombre,
      logo_url:         logoUrl,
      color_primario:   primario,
      color_secundario: secundario,
      color_acento:     acento,
      url_negocio:      urlNegocio,
      footer_texto:     footerTexto,
    }, { onConflict: "user_id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function applyPreset(p: typeof COLORES_PRESET[0]) {
    setPrimario(p.primario);
    setSecundario(p.secundario);
    setAcento(p.acento);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Aviso plan gratis */}
      {!marcaPersonalizada && (
        <div className="bg-amber-950/50 border border-amber-700/40 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium">Plan {planNombre} — Marca bloqueada</p>
              <p className="text-amber-400/70 text-xs mt-0.5">
                Configura tu marca aquí. Se activará automáticamente cuando mejores al plan Creador o superior.
              </p>
            </div>
          </div>
          <Link href="/planes"
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold flex-shrink-0 transition-colors">
            Mejorar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Información básica */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-semibold">Información básica</h2>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Nombre del negocio</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            placeholder="Ej: Marketing Pro Studio"
          />
          <p className="text-gray-600 text-xs mt-2">
            Aparece en la portada y eyebrow de cada capítulo.
          </p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">URL del sitio web</label>
          <input
            value={urlNegocio}
            onChange={(e) => setUrlNegocio(e.target.value)}
            type="url"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            placeholder="Ej: https://mipagina.com"
          />
          <p className="text-gray-600 text-xs mt-2">
            Se muestra en la contraportada del PDF.
          </p>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Pie de página</label>
          <textarea
            value={footerTexto}
            onChange={(e) => setFooterTexto(e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
            placeholder="Ej: Todos los derechos reservados. Este documento es confidencial."
          />
          <p className="text-gray-600 text-xs mt-1">{footerTexto.length}/300 · Aparece en la contraportada.</p>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Logo</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl
                          flex items-center justify-center flex-shrink-0 overflow-hidden">
            {/* eslint-disable @next/next/no-img-element */}
            {logoUrl ? (
              <img src={logoUrl} alt="Logo del negocio" className="w-full h-full object-contain p-2" />
            ) : (
              <Upload className="w-8 h-8 text-gray-600" />
            )}
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-2">
              Sube tu logo en PNG, SVG o JPG (máx. 5MB)
            </p>
            <p className="text-gray-500 text-xs mb-3">
              Se muestra en la portada del PDF junto al nombre del negocio.
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm
                         font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? "Subiendo..." : "Seleccionar archivo"}
            </button>
            <input ref={fileRef} type="file" className="hidden"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoUpload} />
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">Paleta de colores</h2>
        <p className="text-gray-500 text-xs mb-4">
          Se aplican en la portada, títulos, acentos y también guían el estilo de las imágenes IA.
        </p>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap mb-5">
          {COLORES_PRESET.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700
                         hover:border-gray-500 transition-colors text-xs text-gray-300"
            >
              <div className="w-3 h-3 rounded-full" style={{ background: p.primario }} />
              {p.name}
            </button>
          ))}
        </div>

        {/* Pickers */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Color primario",    value: primario,   onChange: setPrimario   },
            { label: "Color secundario",  value: secundario, onChange: setSecundario },
            { label: "Color acento",      value: acento,     onChange: setAcento     },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-xs text-gray-400 mb-2">{label}</label>
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2">
                <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
                  className="w-8 h-8 rounded-md border-0 bg-transparent cursor-pointer" />
                <span className="text-white text-sm font-mono">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-5 rounded-xl overflow-hidden border border-gray-700">
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${primario}, ${secundario})` }} />
          <div className="p-4" style={{ background: primario + "22" }}>
            <p className="font-bold text-base" style={{ color: primario }}>
              {nombre || "Nombre del negocio"}
            </p>
            <p className="text-xs mt-1" style={{ color: secundario }}>
              Vista previa del branding en tus PDFs
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold text-white"
              style={{ background: acento }}>
              Acento
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800
                   text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "¡Guardado!" : saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
