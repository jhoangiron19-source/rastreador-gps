import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backendErrorMessage } from "@/lib/backend";
import type { MobileInput, MobileUpdate, MobileView } from "@/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface MobileFormValues {
  officialName: string;
  mobileIdentifier: string;
  serviceType: string;
  username: string;
  password: string;
}

interface MobileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Móvil a editar; `null` para dar de alta uno nuevo. */
  mobile: MobileView | null;
  onSubmit: (
    values: MobileInput | MobileUpdate,
    mobile: MobileView | null,
  ) => void;
  isPending: boolean;
  error: unknown;
}

function emptyValues(): MobileFormValues {
  return {
    officialName: "",
    mobileIdentifier: "",
    serviceType: "",
    username: "",
    password: "",
  };
}

function valuesFromMobile(mobile: MobileView): MobileFormValues {
  return {
    officialName: mobile.officialName,
    mobileIdentifier: mobile.mobileIdentifier,
    serviceType: mobile.serviceType,
    username: mobile.username,
    password: "",
  };
}

/** Alta y edición de móviles con credenciales de acceso. */
export function MobileForm({
  open,
  onOpenChange,
  mobile,
  onSubmit,
  isPending,
  error,
}: MobileFormProps) {
  const [values, setValues] = useState<MobileFormValues>(emptyValues);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(mobile ? valuesFromMobile(mobile) : emptyValues());
    setTouched(false);
  }, [open, mobile]);

  const isEditing = mobile !== null;
  const missingPassword = !isEditing && values.password.trim() === "";
  const isValid =
    values.officialName.trim() !== "" &&
    values.mobileIdentifier.trim() !== "" &&
    values.serviceType.trim() !== "" &&
    values.username.trim() !== "" &&
    !missingPassword;

  function update<K extends keyof MobileFormValues>(
    key: K,
    value: MobileFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!isValid || isPending) return;

    const base = {
      officialName: values.officialName.trim(),
      mobileIdentifier: values.mobileIdentifier.trim(),
      serviceType: values.serviceType.trim(),
      username: values.username.trim(),
    };

    if (isEditing) {
      const update: MobileUpdate = { ...base };
      if (values.password.trim() !== "") update.password = values.password;
      onSubmit(update, mobile);
      return;
    }

    onSubmit({ ...base, password: values.password }, null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="admin.moviles.form.dialog"
        className="rounded-2xl sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Editar móvil" : "Nuevo móvil"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualizá los datos del funcionario y sus credenciales de acceso."
              : "Registrá un móvil con los datos del funcionario y sus credenciales de acceso."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile-official-name">Nombre del funcionario</Label>
            <Input
              id="mobile-official-name"
              data-ocid="admin.moviles.form.official_name_input"
              value={values.officialName}
              onChange={(event) => update("officialName", event.target.value)}
              placeholder="Ej.: Juan Pérez"
              autoComplete="off"
            />
            {touched && values.officialName.trim() === "" ? (
              <p
                data-ocid="admin.moviles.form.official_name_error"
                className="text-xs font-medium text-destructive"
              >
                Ingresá el nombre del funcionario.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mobile-identifier">Identificador de móvil</Label>
              <Input
                id="mobile-identifier"
                data-ocid="admin.moviles.form.identifier_input"
                value={values.mobileIdentifier}
                onChange={(event) =>
                  update("mobileIdentifier", event.target.value)
                }
                placeholder="Ej.: M-014"
                autoComplete="off"
              />
              {touched && values.mobileIdentifier.trim() === "" ? (
                <p
                  data-ocid="admin.moviles.form.identifier_error"
                  className="text-xs font-medium text-destructive"
                >
                  Ingresá el identificador del móvil.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile-service-type">Tipo de servicio</Label>
              <Input
                id="mobile-service-type"
                data-ocid="admin.moviles.form.service_type_input"
                value={values.serviceType}
                onChange={(event) => update("serviceType", event.target.value)}
                placeholder="Ej.: Traslado programado"
                autoComplete="off"
              />
              {touched && values.serviceType.trim() === "" ? (
                <p
                  data-ocid="admin.moviles.form.service_type_error"
                  className="text-xs font-medium text-destructive"
                >
                  Ingresá el tipo de servicio.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mobile-username">Usuario</Label>
              <Input
                id="mobile-username"
                data-ocid="admin.moviles.form.username_input"
                value={values.username}
                onChange={(event) => update("username", event.target.value)}
                placeholder="usuario.acceso"
                autoComplete="off"
              />
              {touched && values.username.trim() === "" ? (
                <p
                  data-ocid="admin.moviles.form.username_error"
                  className="text-xs font-medium text-destructive"
                >
                  Ingresá el usuario de acceso.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile-password">
                Contraseña
                {isEditing ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    (opcional)
                  </span>
                ) : null}
              </Label>
              <Input
                id="mobile-password"
                type="password"
                data-ocid="admin.moviles.form.password_input"
                value={values.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder={
                  isEditing ? "Dejar vacío para no cambiar" : "••••••••"
                }
                autoComplete="new-password"
              />
              {touched && missingPassword ? (
                <p
                  data-ocid="admin.moviles.form.password_error"
                  className="text-xs font-medium text-destructive"
                >
                  Ingresá una contraseña de acceso.
                </p>
              ) : null}
            </div>
          </div>

          {error ? (
            <p
              data-ocid="admin.moviles.form.error_state"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
            >
              {backendErrorMessage(error)}
            </p>
          ) : null}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              data-ocid="admin.moviles.form.cancel_button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="admin.moviles.form.submit_button"
              disabled={isPending}
              className="rounded-xl bg-gradient-primary shadow-instrument"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEditing ? "Guardar cambios" : "Crear móvil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
