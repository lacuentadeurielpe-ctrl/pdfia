"use client";
import { CreditCard, Plus, ExternalLink, Shield } from "lucide-react";

interface Metodo {
  id:      string;
  tipo:    string;
  resumen: string | null;
  activo:  boolean;
}

interface Props {
  metodos: Metodo[];
}

export default function MetodoPago({ metodos }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-4 h-4 text-indigo-400" />
        <h3 className="text-white font-semibold">Método de pago</h3>
      </div>

      {metodos.length === 0 ? (
        <div className="text-center py-6">
          <CreditCard className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">Sin método de pago registrado</p>
          <p className="text-gray-600 text-xs">Al pagar por MercadoPago, se registra aquí automáticamente.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {metodos.map(m => (
            <div key={m.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{m.resumen ?? "Método MercadoPago"}</p>
                  <p className="text-gray-500 text-xs capitalize">{m.tipo}</p>
                </div>
              </div>
              {m.activo && (
                <span className="text-xs bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded-full">Activo</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Placeholder — se conectará con MercadoPago */}
      <div className="border border-dashed border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Plus className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-sm font-medium">Agregar método de pago</p>
            <p className="text-gray-600 text-xs mt-0.5">
              Disponible próximamente · Los pagos se gestionan de forma segura por MercadoPago.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-gray-600">
        <Shield className="w-3.5 h-3.5 flex-shrink-0" />
        <p className="text-xs">
          Tus datos de pago son procesados y almacenados por{" "}
          <a href="https://www.mercadopago.com.pe" target="_blank" rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5">
            MercadoPago <ExternalLink className="w-3 h-3" />
          </a>
          . FoxPDF nunca almacena datos de tarjetas.
        </p>
      </div>
    </div>
  );
}
