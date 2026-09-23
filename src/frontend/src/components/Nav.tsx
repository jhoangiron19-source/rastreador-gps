import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calculator,
  LayoutDashboard,
  Map as MapIcon,
  Navigation,
  Receipt,
  Route as RouteIcon,
  Smartphone,
  Tags,
} from "lucide-react";
import type { ComponentType } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Panel", icon: LayoutDashboard, adminOnly: true },
  { to: "/admin/moviles", label: "Móviles", icon: Smartphone, adminOnly: true },
  { to: "/admin/mapa", label: "Mapa", icon: MapIcon, adminOnly: true },
  {
    to: "/admin/recorridos",
    label: "Recorridos",
    icon: RouteIcon,
    adminOnly: true,
  },
  {
    to: "/seguimiento",
    label: "Seguimiento",
    icon: Navigation,
    adminOnly: false,
  },
  {
    to: "/calculadora",
    label: "Calculadora",
    icon: Calculator,
    adminOnly: false,
  },
  { to: "/servicios", label: "Servicios", icon: Receipt, adminOnly: false },
  { to: "/tarifas", label: "Tarifas", icon: Tags, adminOnly: false },
];

export function visibleNavItems(isAdmin: boolean): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
}

interface NavProps {
  isAdmin: boolean;
  orientation: "sidebar" | "bar";
}

/** Navegación principal: barra lateral en escritorio, barra inferior en móvil. */
export function Nav({ isAdmin, orientation }: NavProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const items = visibleNavItems(isAdmin);

  if (orientation === "sidebar") {
    return (
      <nav
        aria-label="Navegación principal"
        data-ocid="nav.sidebar"
        className="flex flex-col gap-1"
      >
        {items.map((item) => {
          const active =
            pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={`nav.link.${item.to.replace(/\//g, "_")}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {active ? (
                <span
                  className="ml-auto size-1.5 rounded-full bg-accent"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navegación principal"
      data-ocid="nav.bar"
      className="flex items-stretch gap-1 overflow-x-auto px-2 py-1.5"
    >
      {items.map((item) => {
        const active =
          pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            data-ocid={`nav.link.${item.to.replace(/\//g, "_")}`}
            className={cn(
              "flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[0.6875rem] font-medium transition-smooth",
              active
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
