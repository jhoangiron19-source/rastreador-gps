import AccesoPage from "@/pages/Acceso";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type MockBackend,
  type MockIdentityState,
  createIdentityState,
  createMockBackend,
  createTestQueryClient,
  renderWithProviders,
} from "@/test/harness";

const mockActor: MockBackend = createMockBackend();
const identity: MockIdentityState = createIdentityState();

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
      login: identity.login,
      clear: identity.clear,
      loginStatus: "idle",
      isInitializing: identity.isInitializing,
      isLoginIdle: !identity.isAuthenticated,
      isLoggingIn: identity.isLoggingIn,
      isLoginSuccess: identity.isAuthenticated,
      isLoginError: false,
      isAuthenticated: identity.isAuthenticated,
      loginError: undefined,
    }),
  };
});

function renderAcceso() {
  return renderWithProviders(<AccesoPage />, {
    queryClient: createTestQueryClient(),
  });
}

describe("Acceso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    identity.isAuthenticated = false;
    identity.isInitializing = false;
    identity.isLoggingIn = false;
    mockActor.isCallerAdmin.mockResolvedValue(false);
    mockActor.getCallerMobile.mockResolvedValue(null);
  });

  it("ofrece iniciar sesión con Internet Identity cuando no hay sesión", async () => {
    renderAcceso();

    const loginButton = await screen.findByRole("button", {
      name: /Iniciar sesión con Internet Identity/,
    });
    expect(loginButton).toBeEnabled();

    await userEvent.setup().click(loginButton);
    expect(identity.login).toHaveBeenCalledTimes(1);
  });

  it("muestra la sesión activa y el acceso a seguimiento cuando ya hay identidad", async () => {
    identity.isAuthenticated = true;
    renderAcceso();

    expect(
      await screen.findByText(/Ya tenés una sesión activa/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /Iniciar sesión con Internet Identity/,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Ir a mi seguimiento/ }),
    ).toBeInTheDocument();
  });

  it("rechaza credenciales de administrador incorrectas con un mensaje en español", async () => {
    const user = userEvent.setup();
    renderAcceso();

    await user.type(await screen.findByLabelText("Usuario"), "administrador");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(
      screen.getByRole("button", { name: /Ingresar como administrador/ }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usuario o contraseña incorrectos. Verificá los datos e intentá nuevamente.",
    );
  });

  it("valida las credenciales maestras correctas sin mostrar error", async () => {
    const user = userEvent.setup();
    renderAcceso();

    await user.type(await screen.findByLabelText("Usuario"), ADMIN_USERNAME);
    await user.type(screen.getByLabelText("Contraseña"), ADMIN_PASSWORD);
    await user.click(
      screen.getByRole("button", { name: /Ingresar como administrador/ }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("exige usuario y contraseña antes de validar", async () => {
    const user = userEvent.setup();
    renderAcceso();

    await user.click(
      await screen.findByRole("button", {
        name: /Ingresar como administrador/,
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ingresá el usuario y la contraseña del administrador.",
    );
  });
});
