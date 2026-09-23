import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMinutes, minutesBetween } from "@/lib/format";
import type { DomicilioDraft } from "@/types";
import { MapPin, X } from "lucide-react";

interface DomicilioCardProps {
  index: number;
  domicilio: DomicilioDraft;
  onChange: (index: number, patch: Partial<DomicilioDraft>) => void;
  onRemove: (index: number) => void;
}

/** Tarjeta de un domicilio: dirección, horario de llegada/salida y tiempo calculado. */
export function DomicilioCard({
  index,
  domicilio,
  onChange,
  onRemove,
}: DomicilioCardProps) {
  const position = index + 1;
  const minutes = minutesBetween(
    domicilio.arrivalTime,
    domicilio.departureTime,
  );
  const invalidRange =
    domicilio.arrivalTime !== "" &&
    domicilio.departureTime !== "" &&
    minutes === null;

  return (
    <div
      data-ocid={`calculadora.domicilio.item.${position}`}
      className="animate-fade-in-up rounded-2xl border border-border bg-card p-4 shadow-instrument"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <MapPin className="size-3.5" />
          </span>
          <p className="truncate font-display text-sm font-semibold">
            Domicilio {position}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Eliminar domicilio ${position}`}
          data-ocid={`calculadora.domicilio.delete_button.${position}`}
          onClick={() => onRemove(index)}
          className="size-9 shrink-0 rounded-full bg-destructive/10 text-destructive transition-smooth hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`domicilio-address-${position}`}>Dirección</Label>
          <Input
            id={`domicilio-address-${position}`}
            data-ocid={`calculadora.domicilio.address_input.${position}`}
            value={domicilio.address}
            onChange={(event) =>
              onChange(index, { address: event.target.value })
            }
            placeholder="Ej.: Av. Siempre Viva 742"
            autoComplete="off"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`domicilio-arrival-${position}`}>
              Hora llegada
            </Label>
            <Input
              id={`domicilio-arrival-${position}`}
              type="time"
              data-ocid={`calculadora.domicilio.arrival_input.${position}`}
              value={domicilio.arrivalTime}
              onChange={(event) =>
                onChange(index, { arrivalTime: event.target.value })
              }
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`domicilio-departure-${position}`}>
              Hora salida
            </Label>
            <Input
              id={`domicilio-departure-${position}`}
              type="time"
              data-ocid={`calculadora.domicilio.departure_input.${position}`}
              value={domicilio.departureTime}
              onChange={(event) =>
                onChange(index, { departureTime: event.target.value })
              }
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tiempo en domicilio
          </span>
          <span
            data-ocid={`calculadora.domicilio.time.${position}`}
            className="text-currency text-sm text-foreground"
          >
            {minutes === null ? "—" : formatMinutes(minutes)}
          </span>
        </div>

        {invalidRange ? (
          <p
            data-ocid={`calculadora.domicilio.error.${position}`}
            className="text-xs font-medium text-destructive"
          >
            La hora de salida debe ser posterior a la de llegada.
          </p>
        ) : null}
      </div>
    </div>
  );
}
