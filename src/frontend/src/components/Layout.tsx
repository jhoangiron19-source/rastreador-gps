import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogIn, LogOut, Radio, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

/** Estructura compartida: encabezado fijo, navegación y pie de atribución. */
export function Layout({ children }: LayoutProps) {
  const {
    isAuthenticated,
    isAdmin,
    isInitializing,
    isLoggingIn,
    login,
    logout,
  } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isLoginRoute = pathname === "/acceso";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        data-ocid="app.header"
        className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle"
      >
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 md:px-8">
          <Link
            to={isAuthenticated ? "/calculadora" : "/acceso"}
            data-ocid="app.logo_link"
            className="flex items-center gap-2.5"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-instrument">
              <Radio className="size-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                Rastreador GPS
              </span>
              <span className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                Servicios Hospital
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {isAdmin ? (
              <span
                data-ocid="app.admin_badge"
                className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex"
              >
                <ShieldCheck className="size-3.5" />
                Administrador
              </span>
            ) : null}

            {isAuthenticated ? (
              <Button
                type="button"
                variant="secondary"
                data-ocid="app.logout_button"
                onClick={logout}
                className="h-10 rounded-xl"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            ) : (
              <Button
                type="button"
                data-ocid="app.login_button"
                onClick={() => login()}
                disabled={isInitializing || isLoggingIn}
                className="h-10 rounded-xl bg-gradient-primary shadow-instrument"
              >
                <LogIn className="size-4" />
                {isLoggingIn ? "Ingresando…" : "Iniciar sesión"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 items-stretch">
        {isAuthenticated && !isLoginRoute ? (
          <aside
            data-ocid="app.sidebar"
            className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar px-3 py-5 lg:block"
          >
            <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Navegación
            </p>
            <Nav isAdmin={isAdmin} orientation="sidebar" />
          </aside>
        ) : null}

        <main
          data-ocid="app.content"
          className={cn(
            "min-w-0 flex-1 bg-background px-4 py-6 md:px-8",
            isAuthenticated && !isLoginRoute ? "pb-24 lg:pb-6" : "",
          )}
        >
          {children}
        </main>
      </div>

      {isAuthenticated && !isLoginRoute ? (
        <div
          data-ocid="app.mobile_nav"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-subtle lg:hidden"
        >
          <Nav isAdmin={isAdmin} orientation="bar" />
        </div>
      ) : null}

      <footer
        data-ocid="app.footer"
        className="border-t border-border bg-muted/40 px-4 py-4 md:px-8"
      >
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-row">
          <span>
            Rastreador GPS · Control de móviles y servicios hospitalarios
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="transition-smooth hover:text-foreground"
          >
            © {new Date().getFullYear()}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
