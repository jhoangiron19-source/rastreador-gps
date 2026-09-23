import { useBackendActor } from "@/lib/backend";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export interface AuthState {
  /** Hay una sesión de Internet Identity activa. */
  isAuthenticated: boolean;
  /** El rol del llamador es administrador (lo determina el backend). */
  isAdmin: boolean;
  /** El actor todavía se está creando. */
  isInitializing: boolean;
  /** El popup de Internet Identity está abierto. */
  isLoggingIn: boolean;
  /** El usuario ya validó las credenciales de administrador en esta sesión. */
  isAdminUnlocked: boolean;
  /** El usuario firmado tiene un móvil vinculado. */
  hasMobile: boolean;
  login: () => void;
  logout: () => void;
  /** Valida usuario/contraseña del administrador maestro en el frontend. */
  unlockAdmin: (username: string, password: string) => boolean;
}

/**
 * Estado de sesión de la aplicación.
 * Internet Identity aporta la identidad; el backend determina el rol de
 * administrador. Las credenciales maestras se validan en el frontend.
 */
export function useAuth(): AuthState {
  const { login, clear, isAuthenticated, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const adminQuery = useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    retry: false,
  });

  const mobileQuery = useQuery({
    queryKey: ["callerMobile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerMobile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    retry: false,
  });

  const unlockAdmin = useCallback((username: string, password: string) => {
    const valid =
      username.trim().toLowerCase() === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD;
    if (valid) setIsAdminUnlocked(true);
    return valid;
  }, []);

  const logout = useCallback(() => {
    setIsAdminUnlocked(false);
    clear();
    queryClient.clear();
  }, [clear, queryClient]);

  return {
    isAuthenticated,
    isAdmin: adminQuery.data === true,
    isInitializing: isInitializing || isFetching,
    isLoggingIn,
    isAdminUnlocked,
    hasMobile: mobileQuery.data != null,
    login,
    logout,
    unlockAdmin,
  };
}
