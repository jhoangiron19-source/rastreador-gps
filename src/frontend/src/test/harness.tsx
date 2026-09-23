import type { backendInterface } from "@/backend";
import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

/**
 * Selector de los elementos anotados con `data-ocid` en la aplicación.
 *
 * La UI usa `data-ocid` (no `data-testid`) como ancla estable de test, así que
 * los tests consultan por ese atributo en lugar de por texto o estructura.
 */
export function ocid(id: string): string {
  return `[data-ocid="${id}"]`;
}

/**
 * Doble tipado del actor del backend.
 *
 * Cada método se declara como `vi.fn()` con la firma exacta de
 * `backendInterface`, de modo que un cambio en el contrato público del backend
 * rompe la compilación de este archivo en lugar de pasar desapercibido.
 */
export type MockBackend = {
  [K in keyof backendInterface]: ReturnType<typeof vi.fn>;
};

/** Crea un actor simulado con todos los métodos públicos del backend. */
export function createMockBackend(): MockBackend {
  return {
    _initialize_access_control: vi.fn(),
    _internet_identity_sign_in_finish: vi.fn(),
    _internet_identity_sign_in_start: vi.fn(),
    assignCallerUserRole: vi.fn(),
    assignRoute: vi.fn(),
    calculateService: vi.fn(),
    createMobile: vi.fn(),
    deleteMobile: vi.fn(),
    deleteService: vi.fn(),
    execute: vi.fn(),
    getApiDoc: vi.fn(),
    getCallerMobile: vi.fn(),
    getCallerUserRole: vi.fn(),
    getMobile: vi.fn(),
    getMobilePosition: vi.fn(),
    getRates: vi.fn(),
    getRoute: vi.fn(),
    getService: vi.fn(),
    isCallerAdmin: vi.fn(),
    linkMobilePrincipal: vi.fn(),
    listMobilePositions: vi.fn(),
    listMobiles: vi.fn(),
    listRoutes: vi.fn(),
    listServices: vi.fn(),
    registerPosition: vi.fn(),
    saveService: vi.fn(),
    schema: vi.fn(),
    updateMobile: vi.fn(),
    updateRates: vi.fn(),
    updateService: vi.fn(),
  };
}

/**
 * Estado de sesión simulado que devuelve `useInternetIdentity`.
 * Se expone como objeto mutable para que cada test ajuste la sesión antes de
 * renderizar sin volver a registrar el mock.
 */
export interface MockIdentityState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

export function createIdentityState(
  overrides: Partial<MockIdentityState> = {},
): MockIdentityState {
  return {
    isAuthenticated: false,
    isInitializing: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
    ...overrides,
  };
}

/** Crea un QueryClient de test con reintentos desactivados. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export interface RenderWithProvidersOptions {
  queryClient?: QueryClient;
}

/**
 * Router de memoria mínimo para tests.
 *
 * Los componentes de la aplicación usan `Link` y `useNavigate`, que exigen un
 * contexto de router. Este router monta el componente bajo prueba en la ruta
 * raíz y declara las rutas de destino como placeholders, de modo que la
 * navegación no rompa el render.
 */
export function createTestRouter(ui: ReactElement) {
  const rootRoute = createRootRoute({ component: () => ui });
  const placeholder = () => null;
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/acceso",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/admin",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/admin/moviles",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/admin/mapa",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/admin/recorridos",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/seguimiento",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/calculadora",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/servicios",
      component: placeholder,
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/tarifas",
      component: placeholder,
    }),
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
}

/**
 * Renderiza un componente dentro de los proveedores reales de la aplicación
 * (React Query, Internet Identity y un router de memoria). El actor del backend
 * se sustituye por el mock mediante `vi.mock` en cada archivo de test.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderResult {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const router = createTestRouter(ui);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <InternetIdentityProvider>{children}</InternetIdentityProvider>
      </QueryClientProvider>
    );
  }

  return render(<RouterProvider router={router} />, { wrapper: Wrapper });
}
