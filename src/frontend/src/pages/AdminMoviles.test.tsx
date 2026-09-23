import { MobileStatus } from "@/backend";
import AdminMovilesPage from "@/pages/AdminMoviles";
import type { MobileView } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type MockBackend,
  createMockBackend,
  createTestQueryClient,
  renderWithProviders,
} from "@/test/harness";

const mockActor: MockBackend = createMockBackend();

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: mockActor, isFetching: false }),
  backendErrorMessage: (error: unknown) =>
    error instanceof Error && error.message.trim() !== ""
      ? error.message
      : "Ocurrió un error inesperado. Intentá nuevamente.",
}));

vi.mock("@caffeineai/core-infrastructure", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@caffeineai/core-infrastructure")>();
  return {
    ...actual,
    useInternetIdentity: () => ({
      identity: undefined,
      login: vi.fn(),
      clear: vi.fn(),
      loginStatus: "idle",
      isInitializing: false,
      isLoginIdle: true,
      isLoggingIn: false,
      isLoginSuccess: false,
      isLoginError: false,
      isAuthenticated: true,
      loginError: undefined,
    }),
  };
});

/**
 * Móvil sin posición registrada.
 *
 * El wrapper `@/backend` convierte los opcionales Candid (`[] | [T]`) a
 * `undefined` antes de que el componente los reciba, así que el caso sin datos
 * usa `undefined`.
 */
function mobile(overrides: Partial<MobileView> = {}): MobileView {
  return {
    id: 1n,
    status: MobileStatus.offline,
    serviceType: "Traslado programado",
    username: "juan.perez",
    lastUpdate: undefined,
    officialName: "Juan Pérez",
    lastLatitude: undefined,
    lastLongitude: undefined,
    mobileIdentifier: "M-014",
    ...overrides,
  };
}

function renderAdminMoviles() {
  return renderWithProviders(<AdminMovilesPage />, {
    queryClient: createTestQueryClient(),
  });
}

describe("AdminMoviles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActor.listMobiles.mockResolvedValue([]);
  });

  it("muestra el estado vacío cuando no hay móviles", async () => {
    renderAdminMoviles();

    expect(
      await screen.findByText("Todavía no hay móviles"),
    ).toBeInTheDocument();
  });

  it("crea un móvil con los datos del formulario", async () => {
    const user = userEvent.setup();
    mockActor.createMobile.mockResolvedValue(mobile());
    renderAdminMoviles();

    await user.click(
      await screen.findByRole("button", { name: /Nuevo móvil/ }),
    );

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Nombre del funcionario"),
      "Ana Gómez",
    );
    await user.type(
      within(dialog).getByLabelText("Identificador de móvil"),
      "M-020",
    );
    await user.type(
      within(dialog).getByLabelText("Tipo de servicio"),
      "Emergencia",
    );
    await user.type(within(dialog).getByLabelText("Usuario"), "ana.gomez");
    await user.type(within(dialog).getByLabelText("Contraseña"), "secreta123");
    await user.click(
      within(dialog).getByRole("button", { name: /Crear móvil/ }),
    );

    await waitFor(() => {
      expect(mockActor.createMobile).toHaveBeenCalledWith({
        officialName: "Ana Gómez",
        mobileIdentifier: "M-020",
        serviceType: "Emergencia",
        username: "ana.gomez",
        password: "secreta123",
      });
    });
  });

  it("deshabilita el alta y avisa al alcanzar el límite de 50 móviles", async () => {
    mockActor.listMobiles.mockResolvedValue(
      Array.from({ length: 50 }, (_, index) =>
        mobile({
          id: BigInt(index + 1),
          officialName: `Funcionario ${String(index + 1)}`,
          mobileIdentifier: `M-${String(index + 1)}`,
        }),
      ),
    );

    renderAdminMoviles();

    expect(
      await screen.findByText(/Alcanzaste el límite de 50 móviles/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nuevo móvil/ })).toBeDisabled();
  });

  it("no permite crear un móvil sin contraseña", async () => {
    const user = userEvent.setup();
    renderAdminMoviles();

    await user.click(
      await screen.findByRole("button", { name: /Nuevo móvil/ }),
    );

    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Nombre del funcionario"),
      "Ana Gómez",
    );
    await user.type(
      within(dialog).getByLabelText("Identificador de móvil"),
      "M-020",
    );
    await user.type(
      within(dialog).getByLabelText("Tipo de servicio"),
      "Emergencia",
    );
    await user.type(within(dialog).getByLabelText("Usuario"), "ana.gomez");
    await user.click(
      within(dialog).getByRole("button", { name: /Crear móvil/ }),
    );

    expect(
      await within(dialog).findByText("Ingresá una contraseña de acceso."),
    ).toBeInTheDocument();
    expect(mockActor.createMobile).not.toHaveBeenCalled();
  });
});
