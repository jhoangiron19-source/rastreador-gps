import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackendActor } from "@/lib/backend";
import { formatNumber, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type MobileView, POLL_INTERVAL_MS, STALE_AFTER_MS } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Map as MapIcon,
  Radio,
  Route as RouteIcon,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { useMemo } from "react";

interface SummaryCard {
  key: string;
  label: string;
  value: number;
  icon: typeof Smartphone;
  tone: "primary" | "accent" | "warning";
}

const TONE_CLASSES: Record<SummaryCard["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  warning: "bg-warning/15 text-warning-foreground",
};

const QUICK_LINKS = [
  {
    to: "/admin/moviles",
    label: "Gestionar móviles",
    description: "Alta, edición y baja de móviles con sus credenciales.",
    icon: Smartphone,
  },
  {
    to: "/admin/mapa",
    label: "Ver mapa en tiempo real",
    description: "Posición de cada móvil actualizada periódicamente.",
    icon: MapIcon,
  },
  {
    to: "/admin/recorridos",
    label: "Consultar recorridos",
    description: "Rutas asignadas, kilómetros y tiempos por móvil.",
    icon: RouteIcon,
  },
] as const;

function isStale(mobile: MobileView): boolean {
  if (mobile.lastUpdate === undefined) return true;
  const ms = Number(mobile.lastUpdate / 1_000_000n);
  return Date.now() - ms > STALE_AFTER_MS;
}

/** Panel de administrador: resumen de móviles y accesos rápidos. */
export default function AdminPanelPage() {
  const { actor, isFetching } = useBackendActor();

  const mobilesQuery = useQuery({
    queryKey: ["mobiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMobiles();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const mobiles = useMemo(() => mobilesQuery.data ?? [], [mobilesQuery.data]);

  const online = mobiles.filter(
    (mobile) => mobile.status === "online" && !isStale(mobile),
  ).length;
  const offline = mobiles.length - online;

  const lastUpdate = mobiles.reduce<bigint | undefined>((latest, mobile) => {
    if (mobile.lastUpdate === undefined) return latest;
    if (latest === undefined || mobile.lastUpdate > latest) {
      return mobile.lastUpdate;
    }
    return latest;
  }, undefined);

  const cards: SummaryCard[] = [
    {
      key: "total",
      label: "Móviles registrados",
      value: mobiles.length,
      icon: Smartphone,
      tone: "primary",
    },
    {
      key: "online",
      label: "En línea",
      value: online,
      icon: Radio,
      tone: "accent",
    },
    {
      key: "offline",
      label: "Sin señal",
      value: offline,
      icon: WifiOff,
      tone: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Panel de administrador
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen de la flota de móviles y accesos rápidos a la gestión.
        </p>
      </header>

      <section
        data-ocid="admin.panel.summary_section"
        className="grid gap-4 sm:grid-cols-3"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.key}
              data-ocid={`admin.panel.card.${card.key}`}
              className="rounded-2xl border-border shadow-instrument"
            >
              <CardContent className="flex items-center gap-4 pt-2">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    TONE_CLASSES[card.tone],
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  {mobilesQuery.isLoading ? (
                    <Skeleton className="mt-1 h-7 w-12" />
                  ) : (
                    <p className="font-display text-2xl font-bold tabular">
                      {formatNumber(card.value)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <p className="text-xs text-muted-foreground">
        Última actualización de la flota: {formatRelative(lastUpdate)}
      </p>

      <section
        data-ocid="admin.panel.quick_links_section"
        className="grid gap-4 md:grid-cols-3"
      >
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`admin.panel.link.${link.to.replace(/\//g, "_")}`}
              className="group rounded-2xl border border-border bg-card p-5 shadow-instrument transition-smooth hover:shadow-instrument-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground">
                <Icon className="size-5" />
              </span>
              <p className="mt-3 font-display text-base font-semibold">
                {link.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {link.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Abrir
                <ArrowRight className="size-4 transition-smooth group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
