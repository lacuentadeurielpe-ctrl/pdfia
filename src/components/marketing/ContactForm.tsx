"use client";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-800 rounded-2xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-white font-bold text-lg">¡Mensaje enviado!</h3>
        <p className="text-emerald-300/80 text-sm mt-2">
          Gracias por escribirnos. Te responderemos lo antes posible a tu correo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Nombre *</label>
          <input value={form.nombre} onChange={set("nombre")} required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
                       placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Tu nombre" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Correo *</label>
          <input type="email" value={form.email} onChange={set("email")} required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
                       placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="tu@email.com" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Asunto</label>
        <input value={form.asunto} onChange={set("asunto")}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
                     placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
          placeholder="¿En qué podemos ayudarte?" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Mensaje *</label>
        <textarea value={form.mensaje} onChange={set("mensaje")} required rows={5} maxLength={5000}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm
                     placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
          placeholder="Escribe tu mensaje..." />
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500
                   disabled:bg-orange-900 disabled:cursor-not-allowed text-white font-semibold py-3.5
                   rounded-xl transition-colors">
        <Send className="w-4 h-4" />
        {loading ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
