import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { backendErrorMessage } from "@/lib/backend";
import type { MobileView, RouteInput } from "@/types";
import { Loader2, Route as RouteIcon } from "lucide-react";
import { useState } from "react";

interface RouteFormProps {
  mobiles: MobileView[];
  onSubmit: (input: RouteInput) => void;
  isPending: boolean;
  error: unknown;
}

/** Asignación de una ruta a un móvil con nombre del funcionario y tipo de servicio. */
export function RouteForm({
  mobiles,
  onSubmit,
  isPending,
  error,
}: RouteFormProps) {
  const [mobileId, setMobileId] = useState("");
  const [officialName, setOfficialName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [touched, setTouched] = useState(false);

  const selected = mobiles.find((m) => m.id.toString() === mobileId) ?? null;
  const isValid =
    selected !== null &&
    officialName.trim() !== "" &&
    serviceType.trim() !== "";

  function handleMobileChange(value: string) {
    setMobileId(value);
    const mobile = mobiles.find((m) => m.id.toString() === value);
    if (mobile) {
      setOfficialName(mobile.officialName);
      setServiceType(mobile.serviceType);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!isValid || selected === null || isPending) return;

    onSubmit({
      mobileId: selected.id,
      officialName: officialName.trim(),
      serviceType: serviceType.trim(),
    });

    setMobileId("");
    setOfficialName("");
    setServiceType("");
    setTouched(false);
  }

  return (
    <Card className="rounded-2xl border-border shadow-instrument">
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <RouteIcon className="size-4 text-primary" />
          <h2 className="font-display text-base font-semibold">
            Asignar ruta a un móvil
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="route-mobile">Móvil</Label>
            <Select value={mobileId} onValueChange={handleMobileChange}>
              <SelectTrigger
                id="route-mobile"
                data-ocid="admin.recorridos.form.mobile_select"
                className="h-10 w-full rounded-xl"
              >
                <SelectValue placeholder="Seleccioná un móvil" />
              </SelectTrigger>
              <SelectContent>
                {mobiles.map((mobile) => (
                  <SelectItem
                    key={mobile.id.toString()}
                    value={mobile.id.toString()}
                  >
                    {mobile.officialName} · {mobile.mobileIdentifier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched && selected === null ? (
              <p
                data-ocid="admin.recorridos.form.mobile_error"
                className="text-xs font-medium text-destructive"
              >
                Seleccioná el móvil al que se asigna la ruta.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="route-official-name">
                Nombre del funcionario
              </Label>
              <Input
                id="route-official-name"
                data-ocid="admin.recorridos.form.official_name_input"
                value={officialName}
                onChange={(event) => setOfficialName(event.target.value)}
                placeholder="Ej.: Juan Pérez"
                autoComplete="off"
              />
              {touched && officialName.trim() === "" ? (
                <p
                  data-ocid="admin.recorridos.form.official_name_error"
                  className="text-xs font-medium text-destructive"
                >
                  Ingresá el nombre del funcionario.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="route-service-type">Tipo de servicio</Label>
              <Input
                id="route-service-type"
                data-ocid="admin.recorridos.form.service_type_input"
                value={serviceType}
                onChange={(event) => setServiceType(event.target.value)}
                placeholder="Ej.: Traslado programado"
                autoComplete="off"
              />
              {touched && serviceType.trim() === "" ? (
                <p
                  data-ocid="admin.recorridos.form.service_type_error"
                  className="text-xs font-medium text-destructive"
                >
                  Ingresá el tipo de servicio.
                </p>
              ) : null}
            </div>
          </div>

          {error ? (
            <p
              data-ocid="admin.recorridos.form.error_state"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
            >
              {backendErrorMessage(error)}
            </p>
          ) : null}

          <Button
            type="submit"
            data-ocid="admin.recorridos.form.submit_button"
            disabled={isPending || mobiles.length === 0}
            className="h-10 w-full rounded-xl bg-gradient-primary shadow-instrument sm:w-auto"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Asignar ruta
          </Button>
          {mobiles.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Registrá al menos un móvil para poder asignarle una ruta.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
