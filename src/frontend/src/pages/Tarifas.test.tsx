import TarifasPage from "@/pages/Tarifas";
import { screen, waitFor } from "@testing-library/react";
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

function renderTarifas() {
  return renderWithProviders(<TarifasPage />, {
    queryClient: createTestQueryClient(),
  });
}

describe("Tarifas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActor.getRates.mockResolvedValue({
      bajadaDeBandera: 2400n,
      porKilometro: 850n,
      porMinuto: 170n,
      porTag: 700n,
    });
  });

  it("muestra las tarifas vigentes", async () => {
    renderTarifas();

    expect(await screen.findByLabelText("Bajada de bandera")).toHaveValue(
      "2400",
    );
    expect(screen.getByLabelText("Precio por kilómetro")).toHaveValue("850");
    expect(screen.getByLabelText("Precio por minuto")).toHaveValue("170");
    expect(screen.getByLabelText("Precio por TAG (pórtico)")).toHaveValue(
      "700",
    );
  });

  it("guarda una tarifa editada con el nuevo valor", async () => {
    const user = userEvent.setup();
    mockActor.updateRates.mockResolvedValue({
      bajadaDeBandera: 3000n,
      porKilometro: 850n,
      porMinuto: 170n,
      porTag: 700n,
    });

    renderTarifas();

    const bajada = await screen.findByLabelText("Bajada de bandera");
    await user.clear(bajada);
    await user.type(bajada, "3000");
    await user.click(screen.getByRole("button", { name: /Guardar tarifas/ }));

    await waitFor(() => {
      expect(mockActor.updateRates).toHaveBeenCalledWith({
        bajadaDeBandera: 3000n,
        porKilometro: 850n,
        porMinuto: 170n,
        porTag: 700n,
      });
    });
  });
});
