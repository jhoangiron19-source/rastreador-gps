import { Card, CardContent } from "@/components/ui/card";
import { formatKm, formatNumber, formatPesos } from "@/lib/format";
import type { Rates, ServiceBreakdown } from "@/types";
import { Receipt } from "lucide-react";

interface BreakdownCardProps {
  breakdown: ServiceBreakdown;
  rates: Rates;
  /** Minutos acumulados en domicilios (el resto de `minutos` es espera). */
  domicileMinutes: number;
}

interface BreakdownRowProps {
  label: string;
  detail?: string;
  value: string;
  ocid: string;
}

function BreakdownRow({ label, detail, value, ocid }: BreakdownRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {detail ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </div>
      <span data-ocid={ocid} className="text-currency shrink-0 text-sm">
        {value}
      </span>
    </div>
  );
}

/** Desglose del cálculo con las tarifas vigentes y el total del servicio. */
export function BreakdownCard({
  breakdown,
  rates,
  domicileMinutes,
}: BreakdownCardProps) {
  const waitMinutes = Math.max(0, breakdown.minutos - domicileMinutes);

  return (
    <Card
      data-ocid="calculadora.breakdown.card"
      className="rounded-2xl border-border shadow-instrument"
    >
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Receipt className="size-4" />
          </span>
          <h2 className="font-display text-base font-bold">
            Desglose del cálculo
          </h2>
        </div>

        <div className="space-y-3">
          <BreakdownRow
            label="Bajada de bandera"
            value={formatPesos(breakdown.bajadaDeBandera)}
            ocid="calculadora.breakdown.bajada"
          />
          <BreakdownRow
            label="Km recorridos"
            detail={`${formatKm(breakdown.kilometros)} × ${formatPesos(rates.porKilometro)}`}
            value={formatPesos(breakdown.importeKilometros)}
            ocid="calculadora.breakdown.kilometros"
          />
          <BreakdownRow
            label="Tiempo en domicilio"
            detail={`${formatNumber(domicileMinutes)} min × ${formatPesos(rates.porMinuto)}`}
            value={formatPesos(BigInt(domicileMinutes) * rates.porMinuto)}
            ocid="calculadora.breakdown.tiempo"
          />
          <BreakdownRow
            label="Espera a funcionario"
            detail={`${formatNumber(waitMinutes)} min × ${formatPesos(rates.porMinuto)}`}
            value={formatPesos(BigInt(waitMinutes) * rates.porMinuto)}
            ocid="calculadora.breakdown.espera"
          />
          <BreakdownRow
            label="TAG (pórticos)"
            detail={`${formatNumber(Number(breakdown.cantidadTag))} × ${formatPesos(rates.porTag)}`}
            value={formatPesos(breakdown.importeTag)}
            ocid="calculadora.breakdown.tag"
          />
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-4">
          <span className="font-display text-base font-bold">Total</span>
          <span
            data-ocid="calculadora.breakdown.total"
            className="text-currency text-xl text-primary"
          >
            {formatPesos(breakdown.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
