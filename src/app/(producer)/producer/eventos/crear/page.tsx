import EventForm from "./EventForm";

export default function CrearEventoPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-text">
          Publicar Nuevo Evento
        </h1>
        <p className="text-text-soft font-medium">
          Completá los datos del evento y configurá los sectores o localidades.
        </p>
      </div>

      <EventForm />
    </div>
  );
}
