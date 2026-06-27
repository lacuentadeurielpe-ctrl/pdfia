import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, asunto, mensaje } = await req.json();

    if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
      return NextResponse.json({ error: "Nombre, correo y mensaje son obligatorios." }, { status: 400 });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "El correo no es válido." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("mensajes_contacto").insert({
      nombre:  nombre.trim().slice(0, 200),
      email:   email.trim().slice(0, 200),
      asunto:  (asunto ?? "").trim().slice(0, 300) || null,
      mensaje: mensaje.trim().slice(0, 5000),
      origen:  "landing",
    });

    if (error) {
      return NextResponse.json({ error: "No se pudo enviar el mensaje. Intenta más tarde." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
