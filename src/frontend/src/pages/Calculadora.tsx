import { ServiceForm } from "@/components/calculator/ServiceForm";
import { Toaster } from "@/components/ui/sonner";
import { useRates, useSaveService } from "@/hooks/use-services";
import { backendErrorMessage } from "@/lib/backend";
import { DEFAULT_RATES, type ServiceInput } from "@/types";
import { Calculator } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Calculadora Servicios Hospital: carga, calcula y guarda un servicio. */
export default function CalculadoraPage() {
  const ratesQuery = useRates();
  const saveService = useSaveService();
  const rates = ratesQuery.data ?? DEFAULT_RATES;
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(input: ServiceInput) {
    saveService.mutate(input, {
      onSuccess: (service) => {
        setFormKey((current) => current + 1);
        toast.success("Servicio guardado", {
          description: `${service.officialName} · ${service.kmTraveled.toFixed(2)} km`,
        });
      },
      onError: (error) => {
        toast.error("No se pudo guardar el servicio", {
          description: backendErrorMessage(error),
        });
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calculator className="size-5" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Calculadora Servicios Hospital
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Cargá el recorrido, los domicilios y los TAG para obtener el total del
          servicio con las tarifas vigentes.
        </p>
      </header>

      <ServiceForm
        key={formKey}
        rates={rates}
        isPending={saveService.isPending}
        error={saveService.error}
        onSubmit={handleSubmit}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}
