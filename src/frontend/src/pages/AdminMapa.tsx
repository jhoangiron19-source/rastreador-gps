import { MapView } from "@/components/admin/MapView";
import { useBackendActor } from "@/lib/backend";
import { formatRelative } from "@/lib/format";
import { POLL_INTERVAL_MS } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

/** Mapa en tiempo real con la posición de cada móvil. */
export default function AdminMapaPage() {
  const { actor, isFetching } = useBackendActor();
  const [selectedId, setSelectedId] = useState<bigint | null>(null);

  const positionsQuery = useQuery({
    queryKey: ["mobilePositions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMobilePositions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const positions = positionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Mapa en tiempo real
          </h1>
          <p className="text-sm text-muted-foreground">
            Posición de cada móvil, actualizada automáticamente cada 15
            segundos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Actualizado{" "}
            {formatRelative(BigInt(positionsQuery.dataUpdatedAt) * 1_000_000n)}
          </span>
          <button
            type="button"
            data-ocid="admin.mapa.refresh_button"
            onClick={() => void positionsQuery.refetch()}
            disabled={positionsQuery.isFetching}
            aria-label="Actualizar posiciones"
            className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-instrument transition-smooth hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw
              className={
                positionsQuery.isFetching ? "size-4 animate-spin" : "size-4"
              }
            />
          </button>
        </div>
      </header>

      {positionsQuery.isError ? (
        <p
          data-ocid="admin.mapa.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          No se pudieron cargar las posiciones. Intentá nuevamente en unos
          segundos.
        </p>
      ) : null}

      <MapView
        positions={positions}
        isLoading={positionsQuery.isLoading}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}
