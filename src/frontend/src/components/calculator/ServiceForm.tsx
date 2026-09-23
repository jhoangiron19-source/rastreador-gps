import { BreakdownCard } from "@/components/calculator/BreakdownCard";
import { DomicilioCard } from "@/components/calculator/DomicilioCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatKm,
  formatNumber,
  minutesBetween,
  parseIntegerInput,
  parseNumberInput,
} from "@/lib/format";
import {
  type Domicilio,
  type DomicilioDraft,
  type Rates,
  type ServiceBreakdown,
  type ServiceDraft,
  type ServiceInput,
  emptyDomicilio,
} from "@/types";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus, Save, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

interface ServiceFormProps {
  rates: Rates;
  /** Valores iniciales al editar un servicio existente. */
  initialDraft?: ServiceDraft;
  isPending: boolean;
  error: unknown;
  onSubmit: (input: ServiceInput) => void;
}

/** Convierte los borradores de domicilio en el modelo del backend. */
function toDomicilios(drafts: DomicilioDraft[]): Domicilio[] {
  return drafts.map((draft) => ({
    address: draft.address.trim(),
    arrivalTime: draft.arrivalTime,
    departureTime: draft.departureTime,
    timeAtDomicile: minutesBetween(draft.arrivalTime, draft.departureTime) ?? 0,
  }));
}

/** Calcula el desglose con la misma fórmula que el backend. */
export function computeBreakdown(
  draft: ServiceDraft,
  rates: Rates,
): ServiceBreakdown {
  const kmStart = parseNumberInput(draft.kmStart);
  const kmEnd = parseNumberInput(draft.kmEnd);
  const kilometros = Math.max(0, kmEnd - kmStart);
  const waitMinutes = parseIntegerInput(draft.waitMinutes);
  const domicilios = toDomicilios(draft.domicilios);
  const domicileMinutes = domicilios.reduce(
    (total, item) => total + item.timeAtDomicile,
    0,
  );
  const minutos = waitMinutes + domicileMinutes;
  const cantidadTag = BigInt(parseIntegerInput(draft.tagCount));

  const importeKilometros = BigInt(Math.round(kilometros)) * rates.porKilometro;
  const importeTiempo = BigInt(minutos) * rates.porMinuto;
  const importeTag = cantidadTag * rates.porTag;
  const total =
    rates.bajadaDeBandera + importeKilometros + importeTiempo + importeTag;

  return {
    bajadaDeBandera: rates.bajadaDeBandera,
    kilometros,
    importeKilometros,
    minutos,
    importeTiempo,
    cantidadTag,
    importeTag,
    total,
  };
}

/** Formulario de la calculadora de servicios hospitalarios. */
export function ServiceForm({
  rates,
  initialDraft,
  isPending,
  error,
  onSubmit,
}: ServiceFormProps) {
  const [draft, setDraft] = useState<ServiceDraft>(
    initialDraft ?? {
      officialName: "",
      waitMinutes: "",
      kmStart: "",
      kmEnd: "",
      tagCount: "0",
      domicilios: [],
    },
  );
  const [touched, setTouched] = useState(false);

  const breakdown = useMemo(
    () => computeBreakdown(draft, rates),
    [draft, rates],
  );
  const domicileMinutes = useMemo(
    () =>
      toDomicilios(draft.domicilios).reduce(
        (total, item) => total + item.timeAtDomicile,
        0,
      ),
    [draft.domicilios],
  );
  const kmTraveled = breakdown.kilometros;
  const missingName = draft.officialName.trim() === "";

  function update<K extends keyof ServiceDraft>(
    key: K,
    value: ServiceDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateDomicilio(index: number, patch: Partial<DomicilioDraft>) {
    setDraft((current) => ({
      ...current,
      domicilios: current.domicilios.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addDomicilio() {
    setDraft((current) => ({
      ...current,
      domicilios: [...current.domicilios, emptyDomicilio()],
    }));
  }

  function removeDomicilio(index: number) {
    setDraft((current) => ({
      ...current,
      domicilios: current.domicilios.filter(
        (_item, position) => position !== index,
      ),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (missingName || isPending) return;

    const input: ServiceInput = {
      officialName: draft.officialName.trim(),
      waitMinutes: parseIntegerInput(draft.waitMinutes),
      kmStart: parseNumberInput(draft.kmStart),
      kmEnd: parseNumberInput(draft.kmEnd),
      domicilios: toDomicilios(draft.domicilios),
      tagCount: BigInt(parseIntegerInput(draft.tagCount)),
    };
    onSubmit(input);
  }

  return (
    <form
      data-ocid="calculadora.form"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Card className="rounded-2xl border-border shadow-instrument">
        <CardContent className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="service-official-name">
              Nombre del funcionario
            </Label>
            <Input
              id="service-official-name"
              data-ocid="calculadora.official_name_input"
              value={draft.officialName}
              onChange={(event) => update("officialName", event.target.value)}
              placeholder="Ej.: Juan Pérez"
              autoComplete="off"
              className="h-11 rounded-xl"
            />
            {touched && missingName ? (
              <p
                data-ocid="calculadora.official_name_error"
                className="text-xs font-medium text-destructive"
              >
                Ingresá el nombre del funcionario.
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-wait">Espera a funcionario (minutos)</Label>
            <Input
              id="service-wait"
              inputMode="numeric"
              data-ocid="calculadora.wait_input"
              value={draft.waitMinutes}
              onChange={(event) => update("waitMinutes", event.target.value)}
              placeholder="0"
              autoComplete="off"
              className="h-11 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-instrument">
        <CardContent className="space-y-4 pt-2">
          <h2 className="font-display text-base font-bold">
            Kilometraje del servicio
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-km-start">Km inicio</Label>
              <Input
                id="service-km-start"
                inputMode="decimal"
                data-ocid="calculadora.km_start_input"
                value={draft.kmStart}
                onChange={(event) => update("kmStart", event.target.value)}
                placeholder="0,0"
                autoComplete="off"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-km-end">Km fin</Label>
              <Input
                id="service-km-end"
                inputMode="decimal"
                data-ocid="calculadora.km_end_input"
                value={draft.kmEnd}
                onChange={(event) => update("kmEnd", event.target.value)}
                placeholder="0,0"
                autoComplete="off"
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Km recorridos
            </span>
            <span
              data-ocid="calculadora.km_traveled"
              className="text-currency text-sm"
            >
              {formatKm(kmTraveled)}
            </span>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold">Domicilios</h2>
          <span className="text-xs text-muted-foreground">
            {formatNumber(draft.domicilios.length)} cargados
          </span>
        </div>

        {draft.domicilios.length === 0 ? (
          <div
            data-ocid="calculadora.domicilios.empty_state"
            className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Todavía no agregaste domicilios. Sumá los que necesites para
              calcular el tiempo en cada parada.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {draft.domicilios.map((domicilio, index) => (
              <DomicilioCard
                key={`${domicilio.address}|${domicilio.arrivalTime}|${domicilio.departureTime}|${index}`}
                index={index}
                domicilio={domicilio}
                onChange={updateDomicilio}
                onRemove={removeDomicilio}
              />
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          data-ocid="calculadora.add_domicilio_button"
          onClick={addDomicilio}
          className="h-11 w-full rounded-xl"
        >
          <Plus className="size-4" />
          Agregar domicilio
        </Button>
      </section>

      <Card className="rounded-2xl border-border shadow-instrument">
        <CardContent className="space-y-1.5 pt-2">
          <Label htmlFor="service-tag">
            Cantidad de TAG (pórticos) del servicio
          </Label>
          <Input
            id="service-tag"
            inputMode="numeric"
            data-ocid="calculadora.tag_input"
            value={draft.tagCount}
            onChange={(event) => update("tagCount", event.target.value)}
            placeholder="0"
            autoComplete="off"
            className="h-11 rounded-xl"
          />
        </CardContent>
      </Card>

      <BreakdownCard
        breakdown={breakdown}
        rates={rates}
        domicileMinutes={domicileMinutes}
      />

      {error ? (
        <p
          data-ocid="calculadora.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
        >
          No se pudo guardar el servicio. Revisá los datos e intentá nuevamente.
        </p>
      ) : null}

      <div className="space-y-3">
        <Button
          type="submit"
          data-ocid="calculadora.save_button"
          disabled={isPending}
          className="h-12 w-full rounded-xl bg-gradient-primary text-base shadow-instrument"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          {isPending ? "Guardando…" : "Guardar servicio"}
        </Button>

        <Button
          asChild
          variant="ghost"
          data-ocid="calculadora.rates_link"
          className="h-11 w-full rounded-xl text-muted-foreground"
        >
          <Link to="/tarifas">
            <Settings2 className="size-4" />
            Ver / editar tarifas
          </Link>
        </Button>
      </div>
    </form>
  );
}
