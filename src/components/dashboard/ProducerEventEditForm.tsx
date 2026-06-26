'use client';

import { Formik, Form, FieldArray, type FormikHelpers } from 'formik';
import Swal from 'sweetalert2';
import {
  DashboardFormField,
  DashboardFormSelect,
  DashboardFormTextarea,
} from '@/components/dashboard/DashboardFormField';
import {
  producerEventEditSchema,
  type ProducerEventFormValues,
} from '@/validators/dashboardSchemas';

interface TicketType {
  name: string;
  price: number;
  stock: number;
  zone?: string;
  sold?: number;
}

interface ApiItem {
  id: string;
  name: string;
}

interface Evento {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  status: string;
  ticketTypes: TicketType[];
  venueId?: string;
  categoryId?: string;
}

interface ProducerEventEditFormProps {
  evento: Evento;
  categorias: ApiItem[];
  locaciones: ApiItem[];
  loading: boolean;
  onSave: (values: ProducerEventFormValues) => Promise<void>;
  onChangeStatus: () => void;
  onDelete: () => void;
}

export function buildProducerEventFormValues(evento: Evento): ProducerEventFormValues {
  const date = new Date(evento.eventDate);
  return {
    title: evento.title ?? '',
    description: evento.description ?? '',
    formDate: evento.eventDate ? evento.eventDate.split('T')[0] : '',
    formTime: evento.eventDate
      ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      : '',
    categoryId: evento.categoryId ?? '',
    venueId: evento.venueId ?? '',
    ticketTypes: evento.ticketTypes?.length
      ? evento.ticketTypes.map((ticket) => ({
          name: ticket.name ?? '',
          zone: ticket.zone ?? ticket.name ?? '',
          price: Number(ticket.price) || 0,
          stock: Number(ticket.stock) || 0,
          sold: ticket.sold ?? 0,
        }))
      : [{ name: '', zone: '', price: 0, stock: 0, sold: 0 }],
  };
}

function validateSoldTickets(
  values: ProducerEventFormValues,
  evento: Evento,
): string | null {
  for (let i = 0; i < values.ticketTypes.length; i++) {
    const original = evento.ticketTypes?.[i];
    const modificado = values.ticketTypes[i];
    const vendidos = original?.sold || 0;

    if (vendidos > 0 && original && original.price !== Number(modificado.price)) {
      return `No podés cambiar el precio de "${modificado.name}" porque ya tiene ${vendidos} entradas vendidas.`;
    }
    if (vendidos > 0 && Number(modificado.stock) < vendidos) {
      return `El stock de "${modificado.name}" no puede ser menor a las entradas ya vendidas (${vendidos}).`;
    }
  }
  return null;
}

export default function ProducerEventEditForm({
  evento,
  categorias,
  locaciones,
  loading,
  onSave,
  onChangeStatus,
  onDelete,
}: ProducerEventEditFormProps) {
  const handleSubmit = async (
    values: ProducerEventFormValues,
    helpers: FormikHelpers<ProducerEventFormValues>,
  ) => {
    const soldError = validateSoldTickets(values, evento);
    if (soldError) {
      await Swal.fire({
        title: 'ERROR DE SEGURIDAD',
        text: soldError,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6750e0',
      });
      helpers.setSubmitting(false);
      return;
    }

    try {
      await onSave(values);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      key={evento.id}
      initialValues={buildProducerEventFormValues(evento)}
      validationSchema={producerEventEditSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, isSubmitting }) => {
        const capacidadTotal = values.ticketTypes.reduce(
          (acc, ticket) => acc + (Number(ticket.stock) || 0),
          0,
        );

        return (
          <Form className="bg-surface border-2 border-text p-6 space-y-5 shadow-[4px_4px_0px_0px_var(--color-text)]">
            <div className="flex justify-between items-center border-b-2 border-text pb-1">
              <h3 className="text-lg font-black uppercase">Editor Maestro del Evento</h3>
              <span className="font-mono text-xs bg-secondary/10 border border-text px-2 py-0.5 font-bold uppercase">
                Capacidad total: {capacidadTotal} pax
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardFormField label="Título Comercial" name="title" />
              <DashboardFormSelect
                label="Categoría del Show"
                name="categoryId"
                placeholder="-- Seleccioná Categoría --"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </DashboardFormSelect>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardFormField
                label="Fecha del Evento"
                name="formDate"
                type="date"
                style={{ colorScheme: 'dark' }}
                className="font-mono normal-case"
              />
              <DashboardFormField
                label="Hora del Evento"
                name="formTime"
                type="time"
                style={{ colorScheme: 'dark' }}
                className="font-mono normal-case"
              />
            </div>

            <DashboardFormSelect
              label="Locación / Estadio"
              name="venueId"
              placeholder="-- Seleccioná Lugar --"
            >
              {locaciones.map((ven) => (
                <option key={ven.id} value={ven.id}>
                  {ven.name}
                </option>
              ))}
            </DashboardFormSelect>

            <DashboardFormTextarea
              label="Descripción de Cartelera"
              name="description"
            />

            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-mono font-black uppercase tracking-tight text-primary">
                🔒 Gestión Macroeconómica de Tickets
              </h4>

              <FieldArray name="ticketTypes">
                {({ push }) => (
                  <>
                    <div className="space-y-3">
                      {values.ticketTypes.map((ticket, idx) => {
                        const entradasVendidas = ticket.sold || 0;
                        const tieneVentas = entradasVendidas > 0;
                        const base = `ticketTypes.${idx}`;

                        return (
                          <div
                            key={idx}
                            className={`p-4 border-2 border-text shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${tieneVentas ? 'bg-secondary/5' : 'bg-background'}`}
                          >
                            <div className="flex justify-between items-center mb-2 gap-2">
                              {tieneVentas ? (
                                <span className="text-xs font-mono font-black uppercase text-text">
                                  {ticket.name}
                                </span>
                              ) : (
                                <DashboardFormField
                                  label=""
                                  name={`${base}.name`}
                                  placeholder="NOMBRE DEL TICKET"
                                  hideLabel
                                  className="flex-1 border p-1.5 font-black normal-case"
                                />
                              )}
                              {tieneVentas && (
                                <span className="text-[10px] font-mono bg-accent text-white font-black px-2 py-0.5 uppercase tracking-tighter shrink-0">
                                  ⚠️ BLOQUEO ACTIVO: {entradasVendidas} VENDIDAS
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <DashboardFormField
                                label="Sector"
                                name={`${base}.zone`}
                                disabled={tieneVentas}
                                className="border p-1.5 normal-case"
                              />
                              <DashboardFormField
                                label="Precio ($)"
                                name={`${base}.price`}
                                type="number"
                                disabled={tieneVentas}
                                className="border p-1.5 font-mono normal-case"
                              />
                              <DashboardFormField
                                label="Stock Disponible"
                                name={`${base}.stock`}
                                type="number"
                                min={entradasVendidas}
                                className="border p-1.5 font-mono normal-case"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const { isConfirmed } = await Swal.fire({
                          title: '¿AGREGAR TICKET TYPE?',
                          text: 'Esta acción es irreversible. Una vez guardado, el tipo de ticket no se puede eliminar.',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonText: 'SÍ, AGREGAR',
                          cancelButtonText: 'CANCELAR',
                          confirmButtonColor: '#6750e0',
                        });
                        if (isConfirmed) {
                          push({ name: '', zone: '', price: 0, stock: 0, sold: 0 });
                        }
                      }}
                      className="w-full border-2 border-dashed border-text py-2 font-mono text-xs font-black uppercase text-text-soft hover:text-text hover:border-solid hover:bg-surface transition-all"
                    >
                      + Agregar tipo de ticket
                    </button>
                  </>
                )}
              </FieldArray>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex-1 bg-primary text-background border-2 border-text py-2.5 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none disabled:opacity-50"
              >
                {loading || isSubmitting ? '[ ACTUALIZANDO... ]' : '💾 GUARDAR AJUSTES'}
              </button>

              {(evento.status === 'DRAFT' || evento.status === 'ACTIVE' || evento.status === 'APPROVED') && (
                <button
                  type="button"
                  onClick={onChangeStatus}
                  disabled={loading || isSubmitting}
                  className={`px-4 py-2.5 border-2 border-text font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none disabled:opacity-50 ${
                    evento.status === 'DRAFT'
                      ? 'bg-green-400 text-black'
                      : 'bg-yellow-400 text-black'
                  }`}
                >
                  {loading || isSubmitting
                    ? '[ PROCESANDO... ]'
                    : evento.status === 'DRAFT'
                      ? '📡 PUBLICAR'
                      : '📝 DESPUBLICAR'}
                </button>
              )}

              <button
                type="button"
                onClick={onDelete}
                disabled={loading || isSubmitting}
                className="bg-red-600 text-white border-2 border-red-800 px-4 py-2.5 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:shadow-none disabled:opacity-50"
              >
                {loading || isSubmitting ? '[ PROCESANDO... ]' : '🗑️ DAR DE BAJA'}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
