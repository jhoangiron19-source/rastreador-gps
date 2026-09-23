import { RatesForm } from "@/components/calculator/RatesForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { backendErrorMessage, useBackendActor } from "@/lib/backend";
import { formatPesos } from "@/lib/format";
import { DEFAULT_RATES, type Rates } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const RATES_QUERY_KEY = ["rates"] as const;

/** Ver y editar las tarifas vigentes del servicio. */
export default function TarifasPage() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();

  const ratesQuery = useQuery({
    queryKey: RATES_QUERY_KEY,
    queryFn: async (): Promise<Rates> => {
      if (!actor) return DEFAULT_RATES;
      return actor.getRates();
    },
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async (next: Rates): Promise<Rates> => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.updateRates(next);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RATES_QUERY_KEY });
      toast.success("Tarifas guardadas", {
        description: "Los próximos cálculos usarán los nuevos valores.",
      });
    },
  });

  const rates = ratesQuery.data ?? DEFAULT_RATES;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Tarifas
        </h1>
        <p className="text-sm text-muted-foreground">
          Ajustá los valores que se aplican al calcular cada servicio.
        </p>
      </header>

      <Card
        data-ocid="tarifas.card"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg">
            Valores vigentes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Los cambios se aplican a los cálculos posteriores; los servicios ya
            guardados conservan el importe con el que se registraron.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {ratesQuery.isLoading ? (
            <div
              data-ocid="tarifas.loading_state"
              className="grid gap-4 sm:grid-cols-2"
            >
              {Array.from({ length: 4 }, (_, i) => `rate-skeleton-${i}`).map(
                (id) => (
                  <div key={id} className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ),
              )}
            </div>
          ) : ratesQuery.isError ? (
            <div
              data-ocid="tarifas.error_state"
              className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
            >
              <p className="text-sm font-medium text-destructive">
                {backendErrorMessage(ratesQuery.error)}
              </p>
              <button
                type="button"
                data-ocid="tarifas.retry_button"
                onClick={() => void ratesQuery.refetch()}
                className="inline-flex items-center gap-2 text-sm font-semibold text-destructive underline-offset-4 hover:underline"
              >
                <RefreshCw className="size-4" />
                Reintentar
              </button>
            </div>
          ) : (
            <RatesForm
              key={`${rates.bajadaDeBandera}-${rates.porKilometro}-${rates.porMinuto}-${rates.porTag}`}
              rates={rates}
              onSubmit={(next) => saveMutation.mutate(next)}
              isPending={saveMutation.isPending}
              error={saveMutation.error}
            />
          )}
        </CardContent>
      </Card>

      <div
        data-ocid="tarifas.info_panel"
        className="flex gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-instrument"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
        <p className="text-sm text-muted-foreground">
          Las tarifas actualizadas se usan en los cálculos siguientes: bajada de
          bandera{" "}
          <span className="font-semibold text-foreground">
            {formatPesos(rates.bajadaDeBandera)}
          </span>
          , kilómetro{" "}
          <span className="font-semibold text-foreground">
            {formatPesos(rates.porKilometro)}
          </span>
          , minuto{" "}
          <span className="font-semibold text-foreground">
            {formatPesos(rates.porMinuto)}
          </span>{" "}
          y TAG{" "}
          <span className="font-semibold text-foreground">
            {formatPesos(rates.porTag)}
          </span>
          .
        </p>
      </div>
    </div>
  );
}
