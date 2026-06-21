export interface ConfigNegocio {
  id: string;
  user_id: string;
  nombre_negocio: string;
  logo_url: string | null;
  color_primario: string;
  color_secundario: string;
  color_acento: string;
  fuente_titulo: string;
  fuente_cuerpo: string;
  created_at: string;
  updated_at: string;
}

export interface ProyectoPDF {
  id: string;
  user_id: string;
  titulo: string;
  contexto: string;
  modelo_ia: string;
  modelo_imagen: string;
  incluir_imagenes: boolean;
  num_capitulos: number;
  tono: string;
  estado: "pendiente" | "planificando" | "escribiendo" | "generando_imagenes" | "ensamblando" | "completado" | "error";
  error_msg: string | null;
  outline: string | null;
  created_at: string;
  updated_at: string;
}

export interface PDFGenerado {
  id: string;
  proyecto_id: string;
  user_id: string;
  titulo: string;
  storage_path: string;
  storage_url: string;
  num_paginas: number | null;
  tamano_bytes: number | null;
  modelo_ia: string | null;
  modelo_imagen: string | null;
  tokens_usados: number | null;
  imagenes_generadas: number;
  created_at: string;
}

export type ModeloIA = "gemini-2.0-flash" | "gemini-2.5-pro" | "deepseek-chat" | "claude-sonnet-4-6";
export type ModeloImagen = "gemini-2.5-flash-preview-image-generation" | "gemini-3-pro-image";
export type ComplejidadImagen = "simple" | "compleja" | "datos" | "tecnica";
