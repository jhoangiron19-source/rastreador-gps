import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateTime,
  formatKm,
  formatMinutes,
  formatTime,
} from "@/lib/format";
import type { RouteView } from "@/types";
import { Route as RouteIcon } from "lucide-react";

interface RouteTableProps {
  routes: RouteView[];
  isLoading: boolean;
}

/** Tabla de recorridos con kilómetros totales y tiempos (inicio, fin, duración). */
export function RouteTable({ routes, isLoading }: RouteTableProps) {
  if (isLoading) {
    return (
      <Card
        data-ocid="admin.recorridos.loading_state"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 5 }, (_, i) => `route-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-10 w-full" />
            ),
          )}
        </CardContent>
      </Card>
    );
  }

  if (routes.length === 0) {
    return (
      <Card
        data-ocid="admin.recorridos.empty_state"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <RouteIcon className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold">
              No hay recorridos para los filtros elegidos
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Probá con otro móvil o ampliá el rango de fechas para ver los
              recorridos registrados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-border shadow-instrument">
      <CardContent className="p-0">
        <Table data-ocid="admin.recorridos.table">
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Funcionario</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead className="text-right">Duración</TableHead>
              <TableHead className="text-right">Kilómetros</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route, index) => (
              <TableRow
                key={route.id.toString()}
                data-ocid={`admin.recorridos.row.${index + 1}`}
              >
                <TableCell className="font-medium">
                  {route.officialName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {route.serviceType}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(route.startedAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {route.endedAt === undefined
                    ? "En curso"
                    : formatTime(route.endedAt)}
                </TableCell>
                <TableCell className="text-right tabular">
                  {route.durationMinutes === undefined
                    ? "—"
                    : formatMinutes(route.durationMinutes)}
                </TableCell>
                <TableCell className="text-right font-mono tabular">
                  {formatKm(route.totalKilometers)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
