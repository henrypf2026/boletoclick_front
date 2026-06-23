import Link from "next/link";
import VenueForm from "./VenueForm";

export default function CrearVenuePage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <div className="space-y-2">
        <Link
          href="/producer/dashboard"
          className="inline-block font-mono text-xs font-black uppercase tracking-wider text-text-soft hover:text-text"
        >
          ← Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text">
          Registrar Venue
        </h1>
        <p className="text-text-soft font-medium">
          Añadí el lugar donde vas a organizar tus eventos. Una vez creado, estará disponible al publicar un nuevo evento.
        </p>
      </div>

      <VenueForm />
    </div>
  );
}
