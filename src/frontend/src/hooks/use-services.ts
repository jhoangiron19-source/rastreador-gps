import { createActor } from "@/backend";
import { useBackendActor } from "@/lib/backend";
import type { Rates, Service, ServiceInput, ServiceSummary } from "@/types";
import { DEFAULT_RATES } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Claves de consulta de servicios y tarifas. */
export const serviceKeys = {
  all: ["services"] as const,
  detail: (id: bigint) => ["services", "detail", id.toString()] as const,
  rates: ["rates"] as const,
};

/** Lista los servicios guardados del usuario firmado. */
export function useServices() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<ServiceSummary[]>({
    queryKey: serviceKeys.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listServices();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Detalle de un servicio guardado. */
export function useService(id: bigint | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Service | null>({
    queryKey: serviceKeys.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getService(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** Tarifas vigentes; cae a las tarifas por defecto mientras el backend responde. */
export function useRates() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Rates>({
    queryKey: serviceKeys.rates,
    queryFn: async () => {
      if (!actor) return DEFAULT_RATES;
      return actor.getRates();
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_RATES,
  });
}

/** Guarda un servicio calculado. */
export function useSaveService() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<Service, Error, ServiceInput>({
    mutationFn: async (input: ServiceInput) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.saveService(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

/** Edita un servicio guardado. */
export function useUpdateService() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<Service, Error, { id: bigint; input: ServiceInput }>({
    mutationFn: async ({ id, input }) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.updateService(id, input);
    },
    onSuccess: (service) => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
      void queryClient.invalidateQueries({
        queryKey: serviceKeys.detail(service.id),
      });
    },
  });
}

/** Elimina un servicio guardado. */
export function useDeleteService() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.deleteService(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

/** Reexporta `createActor` para consumidores que lo necesiten. */
export { createActor };
