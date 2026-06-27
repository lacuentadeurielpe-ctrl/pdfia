import { createClient } from "@/lib/supabase/server";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default async function LegalShell({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar isAuth={!!user} />
      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{titulo}</h1>
        <p className="text-gray-500 text-sm mt-3">Última actualización: {actualizado}</p>
        <div className="legal-content mt-10 space-y-6">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
