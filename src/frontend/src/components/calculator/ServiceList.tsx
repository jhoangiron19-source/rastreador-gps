import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDateTime,
  formatKm,
  formatMinutes,
  formatPesos,
} from "@/lib/format";
import type { ServiceSummary } from "@/types";
import { ChevronRight, Pencil, Receipt, Trash2 } from "lucide-react";

interface ServiceListProps {
  services: ServiceSummary[];
  isLoading: boolean;
  onOpen: (service: ServiceSummary) => void;
  onEdit: (service: ServiceSummary) => void;
  onDelete: (service: ServiceSummary) => void;
}

/** Listado de servicios guardados con fecha, funcionario, km, tiempo y total. */
export function ServiceList({
  services,
  isLoading,
  onOpen,
  onEdit,
  onDelete,
}: ServiceListProps) {
  if (isLoading) {
    return (
      <div data-ocid="servicios.loading_state" className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => `service-skeleton-${i}`).map(
          (id) => (
            <Card
              key={id}
              className="rounded-2xl border-border shadow-instrument"
            >
              <CardContent className="space-y-3 pt-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ),
        )}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <Card
        data-ocid="servicios.empty_state"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Receipt className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold">
              Todavía no hay servicios guardados
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Cargá un servicio desde la calculadora para verlo acá con su
              fecha, kilometraje y total.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div data-ocid="servicios.list" className="space-y-3">
      {services.map((service, index) => {
        const position = index + 1;
        return (
          <Card
            key={service.id.toString()}
            data-ocid={`servicios.item.${position}`}
            className="animate-fade-in-up rounded-2xl border-border shadow-instrument transition-smooth hover:shadow-instrument-lg"
          >
            <CardContent className="space-y-4 pt-2">
              <button
                type="button"
                data-ocid={`servicios.open_button.${position}`}
                onClick={() => onOpen(service)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">
                    {service.officialName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDateTime(service.createdAt)}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-primary">
                  <span className="text-currency text-base">
                    {formatPesos(service.total)}
                  </span>
                  <ChevronRight className="size-4" />
                </span>
              </button>

              <dl className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Kilometraje</dt>
                  <dd className="truncate text-currency text-xs">
                    {formatKm(service.kmTraveled)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Tiempo</dt>
                  <dd className="truncate text-currency text-xs">
                    {formatMinutes(service.minutes)}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  data-ocid={`servicios.edit_button.${position}`}
                  onClick={() => onEdit(service)}
                  className="h-9 flex-1 rounded-xl"
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid={`servicios.delete_button.${position}`}
                  onClick={() => onDelete(service)}
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
    </div>
  );
}
