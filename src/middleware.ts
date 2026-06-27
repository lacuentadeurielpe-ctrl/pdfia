import { NextResponse, type NextRequest } from "next/server";

// Rutas públicas exactas (sin sesión)
const PUBLIC_EXACT = ["/"];
// Prefijos públicos: landing, legales, auth y assets
const PUBLIC_PREFIX = [
  "/login",
  "/registro",
  "/privacidad",
  "/terminos",
  "/cookies",
  "/eliminacion-datos",
  "/contacto",
  "/nosotros",
  "/api/auth",
  "/api/contacto",
  "/api/pagos/webhook",
  "/_next",
  "/favicon.ico",
];

// Cookie que Supabase SSR establece al autenticar
const SUPABASE_AUTH_COOKIE = `sb-acekctqfxzmwiumvcfht-auth-token`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIX.some((r) => pathname.startsWith(r));

  // Verificar si existe la cookie de sesión de Supabase
  const hasSession =
    request.cookies.has(SUPABASE_AUTH_COOKIE) ||
    request.cookies.has(`${SUPABASE_AUTH_COOKIE}.0`);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Usuarios con sesión: login/registro los mandamos al panel
  if (hasSession && (pathname === "/login" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
