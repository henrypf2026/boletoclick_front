import * as Yup from 'yup';

const uuidMessage = 'Seleccioná una opción válida';

function toNumber(value: unknown, originalValue: unknown): number | undefined {
  if (originalValue === '' || originalValue === null || originalValue === undefined) {
    return undefined;
  }
  const parsed = Number(originalValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const producerEventEditSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .required('El título es obligatorio'),
  description: Yup.string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .required('La descripción es obligatoria'),
  formDate: Yup.string().required('La fecha es obligatoria'),
  formTime: Yup.string().required('La hora es obligatoria'),
  categoryId: Yup.string().uuid(uuidMessage).required('Seleccioná una categoría'),
  venueId: Yup.string().uuid(uuidMessage).required('Seleccioná una locación'),
  ticketTypes: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().trim().required('El nombre del ticket es obligatorio'),
        zone: Yup.string().trim().required('El sector es obligatorio'),
        price: Yup.number()
          .transform(toNumber)
          .typeError('El precio debe ser un número')
          .moreThan(0, 'El precio debe ser mayor a 0')
          .required('El precio es obligatorio'),
        stock: Yup.number()
          .transform(toNumber)
          .typeError('El stock debe ser un número')
          .integer('El stock debe ser un número entero')
          .min(0, 'El stock no puede ser negativo')
          .required('El stock es obligatorio'),
        sold: Yup.number().transform(toNumber).optional(),
      }),
    )
    .min(1, 'Debe haber al menos un tipo de ticket'),
});

export const userHistoryFilterSchema = Yup.object({
  query: Yup.string()
    .trim()
    .max(80, 'La búsqueda no puede superar 80 caracteres'),
});

export interface ProducerTicketTypeFormValue {
  name: string;
  zone: string;
  price: number;
  stock: number;
  sold?: number;
}

export interface ProducerEventFormValues {
  title: string;
  description: string;
  formDate: string;
  formTime: string;
  categoryId: string;
  venueId: string;
  ticketTypes: ProducerTicketTypeFormValue[];
}

export type UserHistoryFilterValues = Yup.InferType<typeof userHistoryFilterSchema>;
