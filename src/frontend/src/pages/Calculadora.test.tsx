import CalculadoraPage from "@/pages/Calculadora";
import { DEFAULT_RATES } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type MockBackend,
  createMockBackend,
  createTestQueryClient,
  ocid,
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

function renderCalculadora() {
  return renderWithProviders(<CalculadoraPage />, {
    queryClient: createTestQueryClient(),
  });
}

describe("Calculadora Servicios Hospital", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActor.getRates.mockResolvedValue(DEFAULT_RATES);
  });

  it("muestra el total $2.400 con espera 0, km 0 y 0 TAG", async () => {
    renderCalculadora();

    expect(
      await screen.findByText("Calculadora Servicios Hospital"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("$2.400", {
          selector: ocid("calculadora.breakdown.total"),
        }),
      ).toBeInTheDocument();
    });
  });

  it("con km inicio 0 y km fin 10 muestra 10,00 km y $8.500 de kilometraje", async () => {
    const user = userEvent.setup();
    renderCalculadora();

    await user.type(await screen.findByLabelText("Km inicio"), "0");
    await user.type(screen.getByLabelText("Km fin"), "10");

    await waitFor(() => {
      expect(
        screen.getByText("10,00 km", {
          selector: ocid("calculadora.km_traveled"),
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("$8.500", {
          selector: ocid("calculadora.breakdown.kilometros"),
        }),
      ).toBeInTheDocument();
    });
  });

  it("guarda el servicio con el desglose calculado y limpia el formulario", async () => {
    const user = userEvent.setup();
    mockActor.saveService.mockResolvedValue({
      id: 1n,
      owner: undefined as never,
      officialName: "Juan Pérez",
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

    renderCalculadora();

    await user.type(
      await screen.findByLabelText("Nombre del funcionario"),
      "Juan Pérez",
    );
    await user.type(screen.getByLabelText("Km fin"), "10");
    await user.click(screen.getByRole("button", { name: /Guardar servicio/ }));

    await waitFor(() => {
      expect(mockActor.saveService).toHaveBeenCalledTimes(1);
    });

    expect(mockActor.saveService).toHaveBeenCalledWith(
      expect.objectContaining({
        officialName: "Juan Pérez",
        kmStart: 0,
        kmEnd: 10,
        tagCount: 0n,
      }),
    );

    // El formulario se reinicia tras guardar.
    await waitFor(() => {
      expect(screen.getByLabelText("Nombre del funcionario")).toHaveValue("");
    });
  });

  it("aplica las tarifas actualizadas del backend en el desglose", async () => {
    mockActor.getRates.mockResolvedValue({
      bajadaDeBandera: 3000n,
      porKilometro: 1000n,
      porMinuto: 200n,
      porTag: 500n,
    });

    renderCalculadora();

    await waitFor(() => {
      expect(
        screen.getByText("$3.000", {
          selector: ocid("calculadora.breakdown.total"),
        }),
      ).toBeInTheDocument();
    });
  });

  it("exige el nombre del funcionario antes de guardar", async () => {
    const user = userEvent.setup();
    renderCalculadora();

    await user.click(
      await screen.findByRole("button", { name: /Guardar servicio/ }),
    );

    expect(
      await screen.findByText("Ingresá el nombre del funcionario."),
    ).toBeInTheDocument();
    expect(mockActor.saveService).not.toHaveBeenCalled();
  });

  it("agrega y elimina domicilios", async () => {
    const user = userEvent.setup();
    renderCalculadora();

    expect(
      await screen.findByText(/Todavía no agregaste domicilios/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Agregar domicilio/ }));

    expect(await screen.findByText("Domicilio 1")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Eliminar domicilio 1" }),
    );

    await waitFor(() => {
      expect(screen.queryByText("Domicilio 1")).not.toBeInTheDocument();
    });
  });
});
