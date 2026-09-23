import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Acceso tipado al actor del backend.
 * Centraliza `useActor(createActor)` para que los hooks de datos no repitan
 * la creación del actor ni el manejo del estado de carga.
 */
export function useBackendActor() {
  return useActor(createActor);
}

/** Mensaje en español para un error de backend o de red. */
export function backendErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }
  return "Ocurrió un error inesperado. Intentá nuevamente.";
}
