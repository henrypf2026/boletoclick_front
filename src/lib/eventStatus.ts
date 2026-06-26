/** Estado que usa la UI del productor */
export type EventUiStatus = "DRAFT" | "ACTIVE";

/** Convierte el estado de la UI al valor que acepta la API */
export function toApiEventStatus(status: string): string {
  if (status === "ACTIVE") return "APPROVED";
  return status;
}

/** Normaliza respuestas de la API para la UI del productor */
export function normalizeEventStatusForUi(status: string): string {
  if (status === "APPROVED") return "ACTIVE";
  return status;
}
