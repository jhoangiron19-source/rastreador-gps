import { ServiceForm } from "@/components/calculator/ServiceForm";
import { ServiceList } from "@/components/calculator/ServiceList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  useDeleteService,
  useRates,
  useService,
  useServices,
  useUpdateService,
} from "@/hooks/use-services";
import { backendErrorMessage } from "@/lib/backend";
import {
  formatDateTime,
  formatKm,
  formatMinutes,
  formatPesos,
} from "@/lib/format";
import {
  DEFAULT_RATES,
  type ServiceDraft,
  type ServiceInput,
  type ServiceSummary,
} from "@/types";
import { Loader2, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Convierte un servicio guardado en un borrador editable. */
function draftFromService(service: {
  officialName: string;
  waitMinutes: number;
  kmStart: number;
  kmEnd: number;
  tagCount: bigint;
  domicilios: Array<{
    address: string;
    arrivalTime: string;
    departureTime: string;
  }>;
}): ServiceDraft {
  return {
    officialName: service.officialName,
    waitMinutes: String(service.waitMinutes),
    kmStart: String(service.kmStart),
    kmEnd: String(service.kmEnd),
    tagCount: service.tagCount.toString(),
    domicilios: service.domicilios.map((domicilio) => ({
      address: domicilio.address,
      arrivalTime: domicilio.arrivalTime,
      departureTime: domicilio.departureTime,
    })),
  };
}

/** Servicios guardados: listado, detalle, edición y eliminación. */
export default function ServiciosPage() {
  const servicesQuery = useServices();
  const ratesQuery = useRates();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [detailId, setDetailId] = useState<bigint | null>(null);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServiceSummary | null>(
    null,
  );

  const detailQuery = useService(detailId);
  const editQuery = useService(editId);
  const rates = ratesQuery.data ?? DEFAULT_RATES;

  function handleUpdate(input: ServiceInput) {
    if (editId === null) return;
    updateService.mutate(
      { id: editId, input },
      {
        onSuccess: () => {
          toast.success("Servicio actualizado");
          setEditId(null);
        },
        onError: (error) => {
          toast.error("No se pudo actualizar el servicio", {
            description: backendErrorMessage(error),
          });
        },
      },
    );
  }

  function handleDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    deleteService.mutate(target.id, {
      onSuccess: () => {
        toast.success("Servicio eliminado");
        setPendingDelete(null);
        if (detailId === target.id) setDetailId(null);
      },
      onError: (error) => {
        toast.error("No se pudo eliminar el servicio", {
          description: backendErrorMessage(error),
        });
      },
    });
  }

  const detail = detailQuery.data ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="size-5" />
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Servicios guardados
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Consultá, editá o eliminá los servicios registrados con su fecha,
          funcionario, kilometraje y total.
        </p>
      </header>

      <ServiceList
        services={servicesQuery.data ?? []}
        isLoading={servicesQuery.isLoading}
        onOpen={(service) => setDetailId(service.id)}
        onEdit={(service) => setEditId(service.id)}
        onDelete={(service) => setPendingDelete(service)}
      />

      {servicesQuery.isError ? (
        <p
          data-ocid="servicios.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
        >
          No se pudieron cargar los servicios. Intentá nuevamente.
        </p>
      ) : null}

      <Dialog
        open={detailId !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent
          data-ocid="servicios.detail.dialog"
          className="rounded-2xl sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Detalle del servicio
            </DialogTitle>
            <DialogDescription>
              {detail
                ? `${detail.officialName} · ${formatDateTime(detail.createdAt)}`
                : "Cargando el detalle del servicio…"}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading || !detail ? (
            <div
              data-ocid="servicios.detail.loading_state"
              className="space-y-3"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 px-3 py-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Km recorridos
                  </dt>
                  <dd className="text-currency text-sm">
                    {formatKm(detail.kmTraveled)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Tiempo</dt>
                  <dd className="text-currency text-sm">
                    {formatMinutes(detail.breakdown.minutos)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Espera a funcionario
                  </dt>
                  <dd className="text-currency text-sm">
                    {formatMinutes(detail.waitMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">TAG</dt>
                  <dd className="text-currency text-sm">
                    {detail.tagCount.toString()}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Domicilios
                </p>
                {detail.domicilios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Este servicio no registró domicilios.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {detail.domicilios.map((domicilio, index) => (
                      <li
                        key={`${domicilio.address}|${domicilio.arrivalTime}|${domicilio.departureTime}|${index}`}
                        className="rounded-xl border border-border px-3 py-2 text-sm"
                      >
                        <p className="truncate font-medium">
                          {domicilio.address || "Sin dirección"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {domicilio.arrivalTime || "—"} →{" "}
                          {domicilio.departureTime || "—"} ·{" "}
                          {formatMinutes(domicilio.timeAtDomicile)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-display text-base font-bold">Total</span>
                <span
                  data-ocid="servicios.detail.total"
                  className="text-currency text-xl text-primary"
                >
                  {formatPesos(detail.total)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  data-ocid="servicios.detail.edit_button"
                  onClick={() => {
                    setEditId(detail.id);
                    setDetailId(null);
                  }}
                  className="h-10 flex-1 rounded-xl"
                >
                  Editar servicio
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="servicios.detail.delete_button"
                  onClick={() => {
                    setPendingDelete({
                      id: detail.id,
                      createdAt: detail.createdAt,
                      officialName: detail.officialName,
                      kmTraveled: detail.kmTraveled,
                      minutes: detail.breakdown.minutos,
                      total: detail.total,
                    });
                  }}
                  className="h-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editId !== null}
        onOpenChange={(open) => {
          if (!open) setEditId(null);
        }}
      >
        <DialogContent
          data-ocid="servicios.edit.dialog"
          className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Editar servicio</DialogTitle>
            <DialogDescription>
              Actualizá los datos del servicio y guardá los cambios.
            </DialogDescription>
          </DialogHeader>

          {editQuery.isLoading || !editQuery.data ? (
            <div data-ocid="servicios.edit.loading_state" className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : (
            <ServiceForm
              rates={rates}
              initialDraft={draftFromService(editQuery.data)}
              isPending={updateService.isPending}
              error={updateService.error}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent
          data-ocid="servicios.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              ¿Eliminar el servicio?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `Se eliminará el servicio de ${pendingDelete.officialName} del ${formatDateTime(pendingDelete.createdAt)}. Esta acción no se puede deshacer.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              data-ocid="servicios.delete.cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="servicios.delete.confirm_button"
              onClick={handleDelete}
              disabled={deleteService.isPending}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteService.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-center" richColors />
    </div>
  );
}
