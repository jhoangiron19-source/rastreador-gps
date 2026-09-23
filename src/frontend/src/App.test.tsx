import { router } from "@/App";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient } from "@/test/harness";

const authState = {
  isAuthenticated: false,
  isAdmin: false,
  isInitializing: false,
  isLoggingIn: false,
  isAdminUnlocked: false,
  hasMobile: false,
  login: vi.fn(),
  logout: vi.fn(),
  unlockAdmin: vi.fn(),
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/backend", () => ({
  useBackendActor: () => ({ actor: undefined, isFetching: false }),
  backendErrorMessage: (error: unknown) =>
    error instanceof Error && error.message.trim() !== ""
      ? error.message
      : "Ocurrió un error inesperado. Intentá nuevamente.",
}));

describe("Ruta por defecto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    authState.isAdmin = false;
    authState.isInitializing = false;
  });

  it("carga la pantalla de inicio sin quedar en blanco", async () => {
    await router.navigate({ to: "/" });
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "Rastreador GPS" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Iniciar sesión/ }),
    ).toBeInTheDocument();
  });
});
