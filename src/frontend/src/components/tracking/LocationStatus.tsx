import { Card, CardContent } from "@/components/ui/card";
import type { GeolocationState } from "@/hooks/use-geolocation";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AlertTriangle, Crosshair, MapPin, Satellite } from "lucide-react";

interface LocationStatusProps {
  /** Estado devuelto por `useGeolocation`. */
  geo: GeolocationState;
  /** Última posición confirmada por el backend (si existe). */
  lastRegisteredAt?: bigint | null;
}

function formatCoordinate(value: number | null): string {
  return value === null ? "—" : value.toFixed(6);
}

/** Tarjeta de estado del registro GPS: actividad, última posición y avisos. */
export function LocationStatus({ geo, lastRegisteredAt }: LocationStatusProps) {
  const hasFix = geo.latitude !== null && geo.longitude !== null;
  const isDenied = geo.permissionState === "denied";
  const isUnsupported = geo.permissionState === "unsupported";
  const isActive = geo.isWatching && !isDenied && !isUnsupported;

  return (
    <Card
      data-ocid="seguimiento.status_card"
      className="rounded-2xl border-border shadow-instrument"
    >
      <CardContent className="flex flex-col gap-5 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl transition-smooth",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Satellite className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold tracking-tight">
                Registro de ubicación
              </p>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "Registrando tu posición automáticamente"
                  : isDenied
                    ? "Registro detenido por falta de permiso"
                    : isUnsupported
                      ? "Geolocalización no disponible"
                      : "Registro detenido"}
              </p>
            </div>
          </div>

          <span
            data-ocid="seguimiento.status_indicator"
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
              isActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span className="relative flex size-2">
              {isActive ? (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
              ) : null}
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  isActive ? "bg-primary" : "bg-muted-foreground",
                )}
              />
            </span>
            {isActive ? "Activo" : "Inactivo"}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Latitud
            </dt>
            <dd className="text-currency mt-0.5 text-sm">
              {formatCoordinate(geo.latitude)}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Longitud
            </dt>
            <dd className="text-currency mt-0.5 text-sm">
              {formatCoordinate(geo.longitude)}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Precisión
            </dt>
            <dd className="text-currency mt-0.5 text-sm">
              {geo.accuracy === null ? "—" : `± ${Math.round(geo.accuracy)} m`}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Crosshair className="size-4 shrink-0" />
            Última lectura:{" "}
            <span className="font-medium text-foreground">
              {geo.updatedAt === null
                ? "Sin datos"
                : formatRelative(BigInt(geo.updatedAt) * 1_000_000n)}
            </span>
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            Último envío al servidor:{" "}
            <span className="font-medium text-foreground">
              {lastRegisteredAt
                ? formatRelative(lastRegisteredAt)
                : "Sin datos"}
            </span>
          </span>
        </div>

        {isDenied ? (
          <div
            data-ocid="seguimiento.permission_error"
            role="alert"
            className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">
                Permiso de ubicación denegado
              </p>
              <p className="text-muted-foreground">
                Para registrar tu posición, habilitá el acceso a la ubicación
                para este sitio:
              </p>
              <ol className="list-decimal space-y-0.5 pl-5 text-muted-foreground">
                <li>
                  Abrí la configuración del navegador y buscá los permisos del
                  sitio.
                </li>
                <li>
                  Permití el acceso a <strong>Ubicación</strong> y guardá los
                  cambios.
                </li>
                <li>Recargá esta página para reiniciar el registro.</li>
              </ol>
            </div>
          </div>
        ) : null}

        {!isDenied && geo.error ? (
          <div
            data-ocid="seguimiento.error_state"
            role="alert"
            className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <p className="text-foreground">{geo.error}</p>
          </div>
        ) : null}

        {isActive && !hasFix && !geo.error ? (
          <p
            data-ocid="seguimiento.loading_state"
            className="text-sm text-muted-foreground"
          >
            Obteniendo tu posición por primera vez…
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
