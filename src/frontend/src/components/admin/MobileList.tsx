import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MAX_MOBILES, type MobileView, STALE_AFTER_MS } from "@/types";
import { MapPin, Pencil, Smartphone, Trash2, WifiOff } from "lucide-react";

interface MobileListProps {
  mobiles: MobileView[];
  isLoading: boolean;
  onEdit: (mobile: MobileView) => void;
  onDelete: (mobile: MobileView) => void;
}

function isStale(mobile: MobileView): boolean {
  if (mobile.lastUpdate === undefined) return true;
  const ms = Number(mobile.lastUpdate / 1_000_000n);
  return Date.now() - ms > STALE_AFTER_MS;
}

function hasPosition(mobile: MobileView): boolean {
  return (
    mobile.lastLatitude !== undefined && mobile.lastLongitude !== undefined
  );
}

function formatCoordinates(mobile: MobileView): string {
  if (!hasPosition(mobile)) return "Sin posición registrada";
  const lat = mobile.lastLatitude as number;
  const lng = mobile.lastLongitude as number;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/** Listado de móviles con estado, última posición y acciones de edición/baja. */
export function MobileList({
  mobiles,
  isLoading,
  onEdit,
  onDelete,
}: MobileListProps) {
  if (isLoading) {
    return (
      <div
        data-ocid="admin.moviles.loading_state"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, i) => `mobile-skeleton-${i}`).map(
          (id) => (
            <Card
              key={id}
              className="rounded-2xl border-border shadow-instrument"
            >
              <CardContent className="space-y-3 pt-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ),
        )}
      </div>
    );
  }

  if (mobiles.length === 0) {
    return (
      <Card
        data-ocid="admin.moviles.empty_state"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Smartphone className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold">
              Todavía no hay móviles
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Registrá el primer móvil con los datos del funcionario y sus
              credenciales de acceso para comenzar el seguimiento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      data-ocid="admin.moviles.list"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {mobiles.map((mobile, index) => {
        const stale = isStale(mobile);
        const online = mobile.status === "online" && !stale;
        return (
          <Card
            key={mobile.id.toString()}
            data-ocid={`admin.moviles.item.${index + 1}`}
            className="rounded-2xl border-border shadow-instrument transition-smooth hover:shadow-instrument-lg"
          >
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">
                    {mobile.officialName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {mobile.mobileIdentifier} · {mobile.serviceType}
                  </p>
                </div>
                <Badge
                  data-ocid={`admin.moviles.status.${index + 1}`}
                  className={cn(
                    "shrink-0 rounded-full border-transparent px-2.5 py-1 text-xs font-semibold",
                    online
                      ? "bg-primary/10 text-primary"
                      : "bg-warning/15 text-warning-foreground",
                  )}
                >
                  {online ? "En línea" : "Sin señal"}
                </Badge>
              </div>

              <dl className="space-y-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <dt className="sr-only">Última posición</dt>
                  <dd className="truncate font-mono text-xs tabular text-foreground">
                    {formatCoordinates(mobile)}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <WifiOff className="size-4 shrink-0 text-muted-foreground" />
                  <dt className="sr-only">Última actualización</dt>
                  <dd className="truncate text-xs text-muted-foreground">
                    {formatRelative(mobile.lastUpdate)}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  data-ocid={`admin.moviles.edit_button.${index + 1}`}
                  onClick={() => onEdit(mobile)}
                  className="h-9 flex-1 rounded-xl"
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid={`admin.moviles.delete_button.${index + 1}`}
                  onClick={() => onDelete(mobile)}
                  className="h-9 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <p className="text-xs text-muted-foreground md:col-span-2 xl:col-span-3">
        {formatNumber(mobiles.length)} de {formatNumber(MAX_MOBILES)} móviles
        registrados.
      </p>
    </div>
  );
}
