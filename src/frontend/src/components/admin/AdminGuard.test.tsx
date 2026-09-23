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

async function renderAdminRoute() {
  await router.navigate({ to: "/admin/moviles" });
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("Guarda de administrador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    authState.isAdmin = false;
    authState.isInitializing = false;
  });

  it("bloquea las vistas de administrador para un usuario no administrador", async () => {
    await renderAdminRoute();

    expect(await screen.findByText("Acceso restringido")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Móviles" }),
    ).not.toBeInTheDocument();
  });

  it("muestra el panel de móviles cuando el rol es administrador", async () => {
    authState.isAuthenticated = true;
    authState.isAdmin = true;
    await renderAdminRoute();

    expect(
      await screen.findByRole("heading", { name: "Móviles" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Acceso restringido")).not.toBeInTheDocument();
  });
});
