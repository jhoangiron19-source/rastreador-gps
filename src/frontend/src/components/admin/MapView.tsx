import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type MobilePositionView, STALE_AFTER_MS } from "@/types";
import { Crosshair, MapPin, Radio, WifiOff } from "lucide-react";
import { useMemo } from "react";

interface MapViewProps {
  positions: MobilePositionView[];
  isLoading: boolean;
  selectedId: bigint | null;
  onSelect: (id: bigint) => void;
}

interface Plotted {
  position: MobilePositionView;
  x: number;
  y: number;
  stale: boolean;
}

const PADDING = 8;

function isStale(position: MobilePositionView): boolean {
  if (position.lastUpdate === undefined) return true;
  const ms = Number(position.lastUpdate / 1_000_000n);
  return Date.now() - ms > STALE_AFTER_MS;
}

function hasCoordinates(position: MobilePositionView): boolean {
  return position.latitude !== undefined && position.longitude !== undefined;
}

/** Mapa esquemático: proyecta las coordenadas reales sobre un lienzo con grilla. */
export function MapView({
  positions,
  isLoading,
  selectedId,
  onSelect,
}: MapViewProps) {
  const located = useMemo(() => positions.filter(hasCoordinates), [positions]);

  const plotted = useMemo<Plotted[]>(() => {
    if (located.length === 0) return [];
    const lats = located.map((p) => p.latitude as number);
    const lngs = located.map((p) => p.longitude as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 0.01;
    const spanLng = maxLng - minLng || 0.01;

    return located.map((position) => {
      const lat = position.latitude as number;
      const lng = position.longitude as number;
      const x = PADDING + ((lng - minLng) / spanLng) * (100 - PADDING * 2);
      const y = PADDING + ((maxLat - lat) / spanLat) * (100 - PADDING * 2);
      return { position, x, y, stale: isStale(position) };
    });
  }, [located]);

  const selected = useMemo(
    () =>
      selectedId === null
        ? null
        : (positions.find((p) => p.id === selectedId) ?? null),
    [positions, selectedId],
  );

  if (isLoading) {
    return (
      <div
        data-ocid="admin.mapa.loading_state"
        className="grid gap-4 lg:grid-cols-[1fr_20rem]"
      >
        <Skeleton className="h-[26rem] w-full rounded-2xl" />
        <Skeleton className="h-[26rem] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <Card className="overflow-hidden rounded-2xl border-border shadow-instrument">
        <CardContent className="p-0">
          <div
            data-ocid="admin.mapa.canvas_target"
            className="bg-route-grid relative h-[26rem] w-full bg-muted/40"
          >
            {plotted.length === 0 ? (
              <div
                data-ocid="admin.mapa.empty_state"
                className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-instrument">
                  <MapPin className="size-6" />
                </span>
                <div className="space-y-1">
                  <p className="font-display text-lg font-semibold">
                    Sin posiciones para mostrar
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Los móviles aparecerán en el mapa cuando registren su
                    primera posición GPS.
                  </p>
                </div>
              </div>
            ) : (
              plotted.map(({ position, x, y, stale }) => {
                const active = position.id === selectedId;
                return (
                  <button
                    key={position.id.toString()}
                    type="button"
                    data-ocid={`admin.mapa.map_marker.${position.id.toString()}`}
                    onClick={() => onSelect(position.id)}
                    aria-label={`Ver detalle de ${position.officialName}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold shadow-instrument transition-smooth",
                        stale
                          ? "border-warning/40 bg-warning/15 text-warning-foreground"
                          : "border-accent/30 bg-card text-accent",
                        active
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                          : "hover:scale-105",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          stale ? "bg-warning" : "bg-accent",
                        )}
                        aria-hidden="true"
                      />
                      <span className="max-w-[7rem] truncate">
                        {position.mobileIdentifier}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-instrument">
        <CardContent className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Crosshair className="size-4 text-accent" />
            <h2 className="font-display text-base font-semibold">
              Detalle del móvil
            </h2>
          </div>

          {selected === null ? (
            <p
              data-ocid="admin.mapa.detail.empty_state"
              className="rounded-xl bg-muted/50 px-3 py-6 text-center text-sm text-muted-foreground"
            >
              Seleccioná un móvil en el mapa para ver su detalle.
            </p>
          ) : (
            <div
              data-ocid="admin.mapa.detail.panel"
              className="space-y-3 rounded-xl bg-muted/50 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">
                    {selected.officialName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    Móvil {selected.mobileIdentifier}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "shrink-0 rounded-full border-transparent px-2.5 py-1 text-xs font-semibold",
                    isStale(selected)
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {isStale(selected) ? "Sin señal" : "En línea"}
                </Badge>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Última posición</dt>
                  <dd className="font-mono text-xs tabular">
                    {hasCoordinates(selected)
                      ? `${(selected.latitude as number).toFixed(5)}, ${(selected.longitude as number).toFixed(5)}`
                      : "Sin datos"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Actualizado</dt>
                  <dd className="text-xs">
                    {formatRelative(selected.lastUpdate)}
                  </dd>
                </div>
              </dl>

              <Button
                type="button"
                variant="secondary"
                data-ocid="admin.mapa.detail.center_button"
                onClick={() => onSelect(selected.id)}
                className="h-9 w-full rounded-xl"
              >
                <Crosshair className="size-4" />
                Centrar en el mapa
              </Button>
            </div>
          )}

          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Móviles en el mapa
            </p>
            {positions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay móviles registrados.
              </p>
            ) : (
              <ul className="space-y-1">
                {positions.map((position) => {
                  const stale = isStale(position);
                  const active = position.id === selectedId;
                  return (
                    <li key={position.id.toString()}>
                      <button
                        type="button"
                        data-ocid={`admin.mapa.list.item.${position.id.toString()}`}
                        onClick={() => onSelect(position.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-smooth",
                          active
                            ? "bg-accent/10 text-accent"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {stale ? (
                          <WifiOff className="size-3.5 shrink-0" />
                        ) : (
                          <Radio className="size-3.5 shrink-0" />
                        )}
                        <span className="min-w-0 flex-1 truncate">
                          {position.officialName}
                        </span>
                        <span className="shrink-0 font-mono text-xs tabular">
                          {position.mobileIdentifier}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
