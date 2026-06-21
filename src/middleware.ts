import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/api/auth", "/api/debug", "/_next", "/favicon.ico"];

// Cookie que Supabase SSR establece al autenticar
const SUPABASE_AUTH_COOKIE = `sb-acekctqfxzmwiumvcfht-auth-token`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Verificar si existe la cookie de sesión de Supabase
  const hasSession =
    request.cookies.has(SUPABASE_AUTH_COOKIE) ||
    request.cookies.has(`${SUPABASE_AUTH_COOKIE}.0`);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
