import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import AccesoPage from "@/pages/Acceso";
import AdminMapaPage from "@/pages/AdminMapa";
import AdminMovilesPage from "@/pages/AdminMoviles";
import AdminPanelPage from "@/pages/AdminPanel";
import AdminRecorridosPage from "@/pages/AdminRecorridos";
import CalculadoraPage from "@/pages/Calculadora";
import InicioPage from "@/pages/Inicio";
import SeguimientoPage from "@/pages/Seguimiento";
import ServiciosPage from "@/pages/Servicios";
import TarifasPage from "@/pages/Tarifas";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import type { ComponentType } from "react";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

/**
 * Guarda de rol: solo el administrador ve las vistas de administración.
 * A un visitante sin rol se le muestra un aviso en español con acceso a /acceso.
 */
function AdminGuard({ component: Component }: { component: ComponentType }) {
  const { isAdmin, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="mx-auto w-full max-w-md py-8">
        <Card
          data-ocid="admin.guard_loading"
          className="rounded-2xl border-border shadow-instrument"
        >
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              Verificando permisos…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto w-full max-w-md py-8">
        <Card
          data-ocid="admin.guard_denied"
          className="rounded-2xl border-border shadow-instrument"
        >
          <CardContent className="flex flex-col items-start gap-4 pt-2">
            <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-base font-semibold tracking-tight">
                Acceso restringido
              </p>
              <p className="text-sm text-muted-foreground">
                Esta sección es exclusiva del administrador. Iniciá sesión con
                las credenciales de administrador para continuar.
              </p>
            </div>
            <Button
              asChild
              data-ocid="admin.guard_login_button"
              className="h-11 rounded-xl bg-gradient-primary shadow-instrument"
            >
              <Link to="/acceso">Ir a acceso</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Component />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: InicioPage,
});

const accesoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/acceso",
  component: AccesoPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => <AdminGuard component={AdminPanelPage} />,
});

const adminMovilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/moviles",
  component: () => <AdminGuard component={AdminMovilesPage} />,
});

const adminMapaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/mapa",
  component: () => <AdminGuard component={AdminMapaPage} />,
});

const adminRecorridosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/recorridos",
  component: () => <AdminGuard component={AdminRecorridosPage} />,
});

const seguimientoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/seguimiento",
  component: SeguimientoPage,
});

const calculadoraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calculadora",
  component: CalculadoraPage,
});

const serviciosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/servicios",
  component: ServiciosPage,
});

const tarifasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tarifas",
  component: TarifasPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  accesoRoute,
  adminRoute,
  adminMovilesRoute,
  adminMapaRoute,
  adminRecorridosRoute,
  seguimientoRoute,
  calculadoraRoute,
  serviciosRoute,
  tarifasRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
