import CrearPDFForm from "@/components/crear/CrearPDFForm";

export default function CrearPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Crear PDF con IA</h1>
        <p className="text-gray-400 text-sm mt-1">
          Describe tu documento y la IA multi-agente lo construirá completo con imágenes y branding.
        </p>
      </div>
      <CrearPDFForm />
    </div>
  );
}
