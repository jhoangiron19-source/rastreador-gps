import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backendErrorMessage } from "@/lib/backend";
import { formatPesos, parseIntegerInput } from "@/lib/format";
import { DEFAULT_RATES, type Rates } from "@/types";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useState } from "react";

export interface RatesFormValues {
  bajadaDeBandera: string;
  porKilometro: string;
  porMinuto: string;
  porTag: string;
}

interface RatesFormProps {
  /** Tarifas vigentes cargadas desde el backend. */
  rates: Rates;
  /** Persiste las tarifas editadas. */
  onSubmit: (rates: Rates) => void;
  isPending: boolean;
  error: unknown;
}

function valuesFromRates(rates: Rates): RatesFormValues {
  return {
    bajadaDeBandera: rates.bajadaDeBandera.toString(),
    porKilometro: rates.porKilometro.toString(),
    porMinuto: rates.porMinuto.toString(),
    porTag: rates.porTag.toString(),
  };
}

function defaultValues(): RatesFormValues {
  return valuesFromRates(DEFAULT_RATES);
}

const FIELDS: Array<{
  key: keyof RatesFormValues;
  label: string;
  hint: string;
  ocid: string;
}> = [
  {
    key: "bajadaDeBandera",
    label: "Bajada de bandera",
    hint: "Importe fijo al iniciar el servicio.",
    ocid: "tarifas.form.bajada_input",
  },
  {
    key: "porKilometro",
    label: "Precio por kilómetro",
    hint: "Se multiplica por los kilómetros recorridos.",
    ocid: "tarifas.form.kilometro_input",
  },
  {
    key: "porMinuto",
    label: "Precio por minuto",
    hint: "Se multiplica por el tiempo de espera y viaje.",
    ocid: "tarifas.form.minuto_input",
  },
  {
    key: "porTag",
    label: "Precio por TAG (pórtico)",
    hint: "Se multiplica por cada pórtico TAG atravesado.",
    ocid: "tarifas.form.tag_input",
  },
];

/** Formulario de edición de las cuatro tarifas del servicio. */
export function RatesForm({
  rates,
  onSubmit,
  isPending,
  error,
}: RatesFormProps) {
  const [values, setValues] = useState<RatesFormValues>(() =>
    valuesFromRates(rates),
  );
  const [touched, setTouched] = useState(false);

  function update(key: keyof RatesFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (isPending) return;

    onSubmit({
      bajadaDeBandera: BigInt(parseIntegerInput(values.bajadaDeBandera)),
      porKilometro: BigInt(parseIntegerInput(values.porKilometro)),
      porMinuto: BigInt(parseIntegerInput(values.porMinuto)),
      porTag: BigInt(parseIntegerInput(values.porTag)),
    });
  }

  function handleRestoreDefaults() {
    setValues(defaultValues());
    setTouched(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const raw = values[field.key];
          const isEmpty = raw.trim() === "";
          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`rate-${field.key}`}>{field.label}</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                  $
                </span>
                <Input
                  id={`rate-${field.key}`}
                  data-ocid={field.ocid}
                  inputMode="numeric"
                  value={raw}
                  onChange={(event) => update(field.key, event.target.value)}
                  placeholder="0"
                  autoComplete="off"
                  className="h-11 rounded-xl border-input bg-card pl-7 text-right font-mono tabular"
                />
              </div>
              {isEmpty ? (
                <p
                  data-ocid={`${field.ocid}_error`}
                  className="text-xs font-medium text-destructive"
                >
                  Ingresá un importe en pesos.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {field.hint} Equivale a{" "}
                  <span className="font-semibold text-foreground">
                    {formatPesos(parseIntegerInput(raw))}
                  </span>
                  .
                </p>
              )}
            </div>
          );
        })}
      </div>

      {touched && error ? (
        <p
          data-ocid="tarifas.form.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
        >
          {backendErrorMessage(error)}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          data-ocid="tarifas.form.restore_button"
          onClick={handleRestoreDefaults}
          disabled={isPending}
          className="h-11 justify-start rounded-xl text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Restaurar valores por defecto
        </Button>

        <Button
          type="submit"
          data-ocid="tarifas.form.save_button"
          disabled={isPending}
          className="h-11 rounded-xl bg-gradient-primary px-6 shadow-instrument"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? "Guardando…" : "Guardar tarifas"}
        </Button>
      </div>
    </form>
  );
}
