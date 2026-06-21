"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Save, Check } from "lucide-react";

interface Config {
  id: string;
  nombre_negocio: string;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
  color_acento: string;
  fuente_titulo: string;
  fuente_cuerpo: string;
}

interface Props {
  config: Config | null;
  userId: string;
}

const COLORES_PRESET = [
  { name: "Índigo", primario: "#6366f1", secundario: "#8b5cf6", acento: "#06b6d4" },
  { name: "Esmeralda", primario: "#10b981", secundario: "#059669", acento: "#f59e0b" },
  { name: "Rosa", primario: "#ec4899", secundario: "#f43f5e", acento: "#8b5cf6" },
  { name: "Naranja", primario: "#f97316", secundario: "#ef4444", acento: "#eab308" },
  { name: "Azul", primario: "#3b82f6", secundario: "#1d4ed8", acento: "#06b6d4" },
  { name: "Pizarra", primario: "#475569", secundario: "#334155", acento: "#6366f1" },
];

export default function AjustesForm({ config, userId }: Props) {
  const [nombre, setNombre] = useState(config?.nombre_negocio ?? "");
  const [logoUrl, setLogoUrl] = useState(config?.logo_url ?? null);
  const [primario, setPrimario] = useState(config?.color_primario ?? "#6366f1");
  const [secundario, setSecundario] = useState(config?.color_secundario ?? "#8b5cf6");
  const [acento, setAcento] = useState(config?.color_acento ?? "#06b6d4");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      user_id: userId,
      nombre_negocio: nombre,
      logo_url: logoUrl,
      color_primario: primario,
      color_secundario: secundario,
      color_acento: acento,
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

      {/* Nombre del negocio */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Información básica</h2>
        <label className="block text-sm text-gray-400 mb-1.5">Nombre del negocio</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
          placeholder="Ej: Marketing Pro Studio"
        />
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
        <p className="text-gray-500 text-xs mb-4">Se usarán en portadas, títulos y acentos de tus PDFs</p>

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
            { label: "Color primario", value: primario, onChange: setPrimario },
            { label: "Color secundario", value: secundario, onChange: setSecundario },
            { label: "Color acento", value: acento, onChange: setAcento },
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
