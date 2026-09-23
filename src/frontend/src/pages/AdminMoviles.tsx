import { MobileForm } from "@/components/admin/MobileForm";
import { MobileList } from "@/components/admin/MobileList";
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
import { useBackendActor } from "@/lib/backend";
import { formatNumber } from "@/lib/format";
import {
  MAX_MOBILES,
  type MobileInput,
  type MobileUpdate,
  type MobileView,
  POLL_INTERVAL_MS,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, Plus } from "lucide-react";
import { useState } from "react";

/** Gestión de móviles: alta, edición y baja con límite de 50. */
export default function AdminMovilesPage() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MobileView | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MobileView | null>(null);

  const mobilesQuery = useQuery({
    queryKey: ["mobiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMobiles();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const mobiles = mobilesQuery.data ?? [];
  const limitReached = mobiles.length >= MAX_MOBILES;

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      values: MobileInput | MobileUpdate;
      mobile: MobileView | null;
    }) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      if (payload.mobile === null) {
        return actor.createMobile(payload.values as MobileInput);
      }
      return actor.updateMobile(
        payload.mobile.id,
        payload.values as MobileUpdate,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mobiles"] });
      void queryClient.invalidateQueries({ queryKey: ["mobilePositions"] });
      setFormOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mobile: MobileView) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.deleteMobile(mobile.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mobiles"] });
      void queryClient.invalidateQueries({ queryKey: ["mobilePositions"] });
      setPendingDelete(null);
    },
  });

  function openCreate() {
    setEditing(null);
    saveMutation.reset();
    setFormOpen(true);
  }

  function openEdit(mobile: MobileView) {
    setEditing(mobile);
    saveMutation.reset();
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Móviles
          </h1>
          <p className="text-sm text-muted-foreground">
            Alta, edición y baja de móviles con sus credenciales de acceso.
          </p>
        </div>
        <Button
          type="button"
          data-ocid="admin.moviles.create_button"
          onClick={openCreate}
          disabled={limitReached}
          className="h-10 rounded-xl bg-gradient-primary shadow-instrument"
        >
          <Plus className="size-4" />
          Nuevo móvil
        </Button>
      </header>

      {limitReached ? (
        <p
          data-ocid="admin.moviles.limit_state"
          className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm font-medium text-warning-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0" />
          Alcanzaste el límite de {formatNumber(MAX_MOBILES)} móviles. Eliminá
          un móvil existente para poder registrar uno nuevo.
        </p>
      ) : null}

      {mobilesQuery.isError ? (
        <p
          data-ocid="admin.moviles.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          No se pudo cargar el listado de móviles. Intentá nuevamente en unos
          segundos.
        </p>
      ) : null}

      <MobileList
        mobiles={mobiles}
        isLoading={mobilesQuery.isLoading}
        onEdit={openEdit}
        onDelete={setPendingDelete}
      />

      <MobileForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        mobile={editing}
        onSubmit={(values, mobile) => saveMutation.mutate({ values, mobile })}
        isPending={saveMutation.isPending}
        error={saveMutation.error}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent
          data-ocid="admin.moviles.delete_dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Eliminar móvil
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `¿Confirmás la baja de ${pendingDelete.officialName} (${pendingDelete.mobileIdentifier})? Esta acción no se puede deshacer.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.error ? (
            <p
              data-ocid="admin.moviles.delete_error_state"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive"
            >
              No se pudo eliminar el móvil. Intentá nuevamente.
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.moviles.delete_cancel_button"
              className="rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.moviles.delete_confirm_button"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (pendingDelete) deleteMutation.mutate(pendingDelete);
              }}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar móvil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
