import ServiciosPage from "@/pages/Servicios";
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

function renderServicios() {
  return renderWithProviders(<ServiciosPage />, {
    queryClient: createTestQueryClient(),
  });
}

describe("Servicios guardados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActor.getRates.mockResolvedValue({
      bajadaDeBandera: 2400n,
      porKilometro: 850n,
      porMinuto: 170n,
      porTag: 700n,
    });
  });

  it("lista los servicios guardados con su total", async () => {
    mockActor.listServices.mockResolvedValue([
      {
        id: 1n,
        createdAt: 1_700_000_000_000_000_000n,
        officialName: "Juan Pérez",
        kmTraveled: 10,
        minutes: 0,
        total: 10900n,
      },
    ]);

    renderServicios();

    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("$10.900")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay servicios guardados", async () => {
    mockActor.listServices.mockResolvedValue([]);

    renderServicios();

    expect(
      await screen.findByText("Todavía no hay servicios guardados"),
    ).toBeInTheDocument();
  });

  it("abre el detalle de un servicio con su total", async () => {
    const user = userEvent.setup();
    mockActor.listServices.mockResolvedValue([
      {
        id: 7n,
        createdAt: 1_700_000_000_000_000_000n,
        officialName: "Ana Gómez",
        kmTraveled: 10,
        minutes: 0,
        total: 10900n,
      },
    ]);
    mockActor.getService.mockResolvedValue({
      id: 7n,
      owner: undefined as never,
      officialName: "Ana Gómez",
      waitMinutes: 0,
      kmStart: 0,
      kmEnd: 10,
      kmTraveled: 10,
      domicilios: [],
      tagCount: 0n,
      breakdown: {
        bajadaDeBandera: 2400n,
        kilometros: 10,
        importeKilometros: 8500n,
        minutos: 0,
        importeTiempo: 0n,
        cantidadTag: 0n,
        importeTag: 0n,
        total: 10900n,
      },
      total: 10900n,
      createdAt: 1_700_000_000_000_000_000n,
    });

    renderServicios();

    await user.click(await screen.findByRole("button", { name: /Ana Gómez/ }));

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => {
      expect(
        within(dialog).getByText("$10.900", {
          selector: '[data-ocid="servicios.detail.total"]',
        }),
      ).toBeInTheDocument();
    });
  });
});
