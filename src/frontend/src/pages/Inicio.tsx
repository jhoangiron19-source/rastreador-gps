import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";
import { Calculator, LogIn, Navigation } from "lucide-react";

/** Pantalla de inicio: deriva al panel, a la calculadora o al acceso. */
export default function InicioPage() {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Rastreador GPS
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Control de móviles en tiempo real y cálculo de servicios
          hospitalarios.
        </p>
      </div>

      <Card
        data-ocid="inicio.card"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardContent className="flex flex-col gap-4 pt-2">
          {isInitializing ? (
            <p className="text-sm text-muted-foreground">Verificando sesión…</p>
          ) : isAuthenticated ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sesión activa. Elegí una sección para continuar.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {isAdmin ? (
                  <Button
                    asChild
                    data-ocid="inicio.admin_button"
                    className="h-11 flex-1 rounded-xl bg-gradient-primary shadow-instrument"
                  >
                    <Link to="/admin">Ir al panel de administrador</Link>
                  </Button>
                ) : null}
                <Button
                  asChild
                  variant="secondary"
                  data-ocid="inicio.calculadora_button"
                  className="h-11 flex-1 rounded-xl"
                >
                  <Link to="/calculadora">
                    <Calculator className="size-4" />
                    Calculadora
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  data-ocid="inicio.seguimiento_button"
                  className="h-11 flex-1 rounded-xl"
                >
                  <Link to="/seguimiento">
                    <Navigation className="size-4" />
                    Seguimiento
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Iniciá sesión para registrar tu ubicación y calcular servicios.
              </p>
              <Button
                asChild
                data-ocid="inicio.acceso_button"
                className="h-11 rounded-xl bg-gradient-primary shadow-instrument"
              >
                <Link to="/acceso">
                  <LogIn className="size-4" />
                  Iniciar sesión
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
