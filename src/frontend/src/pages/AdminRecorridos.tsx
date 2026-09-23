import { RouteForm } from "@/components/admin/RouteForm";
import { RouteTable } from "@/components/admin/RouteTable";
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
import { useBackendActor } from "@/lib/backend";
import { formatNumber } from "@/lib/format";
import type { RouteFilter, RouteInput } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

const ALL_MOBILES = "todos";

/** Convierte una fecha "YYYY-MM-DD" en timestamp nanosegundo (inicio del día). */
function startOfDayNs(value: string): bigint | undefined {
  if (value === "") return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return BigInt(date.getTime()) * 1_000_000n;
}

/** Convierte una fecha "YYYY-MM-DD" en timestamp nanosegundo (fin del día). */
function endOfDayNs(value: string): bigint | undefined {
  if (value === "") return undefined;
  const date = new Date(`${value}T23:59:59.999`);
  if (Number.isNaN(date.getTime())) return undefined;
  return BigInt(date.getTime()) * 1_000_000n;
}

/** Rutas y recorridos: asignación y consulta filtrada por móvil y fechas. */
export default function AdminRecorridosPage() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();

  const [mobileFilter, setMobileFilter] = useState(ALL_MOBILES);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const mobilesQuery = useQuery({
    queryKey: ["mobiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMobiles();
    },
    enabled: !!actor && !isFetching,
  });

  const mobiles = mobilesQuery.data ?? [];

  const filter = useMemo<RouteFilter>(() => {
    const next: RouteFilter = {};
    if (mobileFilter !== ALL_MOBILES) next.mobileId = BigInt(mobileFilter);
    const from = startOfDayNs(fromDate);
    if (from !== undefined) next.from = from;
    const to = endOfDayNs(toDate);
    if (to !== undefined) next.to = to;
    return next;
  }, [mobileFilter, fromDate, toDate]);

  const routesQuery = useQuery({
    queryKey: ["routes", mobileFilter, fromDate, toDate],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRoutes(filter);
    },
    enabled: !!actor && !isFetching,
  });

  const assignMutation = useMutation({
    mutationFn: async (input: RouteInput) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.assignRoute(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });

  const routes = routesQuery.data ?? [];
  const hasFilters =
    mobileFilter !== ALL_MOBILES || fromDate !== "" || toDate !== "";

  function clearFilters() {
    setMobileFilter(ALL_MOBILES);
    setFromDate("");
    setToDate("");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Rutas y recorridos
        </h1>
        <p className="text-sm text-muted-foreground">
          Asigná rutas a los móviles y consultá los recorridos con kilómetros y
          tiempos.
        </p>
      </header>

      <RouteForm
        mobiles={mobiles}
        onSubmit={(input) => assignMutation.mutate(input)}
        isPending={assignMutation.isPending}
        error={assignMutation.error}
      />

      <Card className="rounded-2xl border-border shadow-instrument">
        <CardContent className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-accent" />
            <h2 className="font-display text-base font-semibold">
              Filtros de consulta
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filter-mobile">Móvil</Label>
              <Select value={mobileFilter} onValueChange={setMobileFilter}>
                <SelectTrigger
                  id="filter-mobile"
                  data-ocid="admin.recorridos.filter.mobile_select"
                  className="h-10 w-full rounded-xl"
                >
                  <SelectValue placeholder="Todos los móviles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_MOBILES}>Todos los móviles</SelectItem>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-from">Desde</Label>
              <Input
                id="filter-from"
                type="date"
                data-ocid="admin.recorridos.filter.from_input"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-to">Hasta</Label>
              <Input
                id="filter-to"
                type="date"
                data-ocid="admin.recorridos.filter.to_input"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {formatNumber(routes.length)} recorrido
              {routes.length === 1 ? "" : "s"} encontrado
              {routes.length === 1 ? "" : "s"}.
            </p>
            <Button
              type="button"
              variant="secondary"
              data-ocid="admin.recorridos.filter.clear_button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="h-9 rounded-xl"
            >
              <RotateCcw className="size-4" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {routesQuery.isError ? (
        <p
          data-ocid="admin.recorridos.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          No se pudieron cargar los recorridos. Intentá nuevamente en unos
          segundos.
        </p>
      ) : null}

      <RouteTable routes={routes} isLoading={routesQuery.isLoading} />
    </div>
  );
}
