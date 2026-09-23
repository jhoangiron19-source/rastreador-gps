import { LocationStatus } from "@/components/tracking/LocationStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useGeolocation } from "@/hooks/use-geolocation";
import { usePolling } from "@/hooks/use-polling";
import { backendErrorMessage, useBackendActor } from "@/lib/backend";
import { formatDateTime, formatRelative } from "@/lib/format";
import { POLL_INTERVAL_MS } from "@/types";
import type { MobileView } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Link2, LogIn, Navigation, Play, Square, UserX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Registro GPS del usuario: envía su posición al backend periódicamente. */
export default function SeguimientoPage() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  const geo = useGeolocation();
  const [lastSentAt, setLastSentAt] = useState<bigint | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [linkUsername, setLinkUsername] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const lastSentRef = useRef(0);

  const mobileQuery = useQuery({
    queryKey: ["callerMobile"],
    queryFn: async (): Promise<MobileView | null> => {
      if (!actor) return null;
      return actor.getCallerMobile();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.registerPosition(coords.latitude, coords.longitude);
    },
    onSuccess: (position) => {
      setLastSentAt(position.recordedAt);
      setSendError(null);
      void queryClient.invalidateQueries({
        queryKey: ["callerMobile"],
      });
    },
    onError: (error) => {
      setSendError(backendErrorMessage(error));
    },
  });

  const { mutate: sendPosition } = registerMutation;

  const linkMutation = useMutation({
    mutationFn: async (credentials: {
      username: string;
      password: string;
    }) => {
      if (!actor) throw new Error("El backend todavía no está disponible.");
      return actor.linkMobilePrincipal(
        credentials.username,
        credentials.password,
      );
    },
    onSuccess: () => {
      setLinkError(null);
      setLinkUsername("");
      setLinkPassword("");
      void queryClient.invalidateQueries({ queryKey: ["callerMobile"] });
    },
    onError: (error) => {
      setLinkError(backendErrorMessage(error));
    },
  });

  const handleLinkSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (linkUsername.trim() === "" || linkPassword === "") {
        setLinkError("Ingresá el usuario y la contraseña de tu móvil.");
        return;
      }
      linkMutation.mutate({
        username: linkUsername.trim(),
        password: linkPassword,
      });
    },
    [linkMutation, linkPassword, linkUsername],
  );

  const sendCurrentPosition = useCallback(() => {
    if (geo.latitude === null || geo.longitude === null) return;
    const now = Date.now();
    if (now - lastSentRef.current < POLL_INTERVAL_MS) return;
    lastSentRef.current = now;
    sendPosition({ latitude: geo.latitude, longitude: geo.longitude });
  }, [geo.latitude, geo.longitude, sendPosition]);

  // Inicia el registro automáticamente al abrir la página con sesión activa.
  useEffect(() => {
    if (!isAuthenticated) return;
    geo.start();
  }, [isAuthenticated, geo.start]);

  // Envía la posición al backend de forma periódica mientras hay lectura GPS.
  usePolling(
    sendCurrentPosition,
    POLL_INTERVAL_MS,
    isAuthenticated && geo.isWatching,
  );

  // Envía la primera lectura apenas se obtiene, sin esperar al intervalo.
  useEffect(() => {
    if (!isAuthenticated || geo.latitude === null || geo.longitude === null) {
      return;
    }
    if (lastSentRef.current !== 0) return;
    lastSentRef.current = Date.now();
    sendPosition({ latitude: geo.latitude, longitude: geo.longitude });
  }, [isAuthenticated, geo.latitude, geo.longitude, sendPosition]);

  const mobile = mobileQuery.data ?? null;
  const hasMobile = mobile !== null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Seguimiento
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu ubicación se registra automáticamente mientras esta página está
          abierta.
        </p>
      </div>

      {isInitializing ? (
        <Card
          data-ocid="seguimiento.loading_state"
          className="rounded-2xl border-border shadow-instrument"
        >
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground">Verificando sesión…</p>
          </CardContent>
        </Card>
      ) : !isAuthenticated ? (
        <Card
          data-ocid="seguimiento.auth_required"
          className="rounded-2xl border-border shadow-instrument"
        >
          <CardContent className="flex flex-col items-start gap-4 pt-2">
            <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <LogIn className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-base font-semibold tracking-tight">
                Iniciá sesión para registrar tu ubicación
              </p>
              <p className="text-sm text-muted-foreground">
                Necesitás una sesión activa para que el sistema asocie tu
                posición a tu móvil.
              </p>
            </div>
            <Button
              asChild
              data-ocid="seguimiento.login_button"
              className="h-11 rounded-xl bg-gradient-primary shadow-instrument"
            >
              <Link to="/acceso">
                <LogIn className="size-4" />
                Iniciar sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <LocationStatus geo={geo} lastRegisteredAt={lastSentAt} />

          {sendError ? (
            <div
              data-ocid="seguimiento.send_error"
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
            >
              {sendError}
            </div>
          ) : null}

          <Card
            data-ocid="seguimiento.mobile_card"
            className="rounded-2xl border-border shadow-instrument"
          >
            <CardContent className="flex flex-col gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Navigation className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold tracking-tight">
                    Tu móvil
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Identidad asociada a tu sesión
                  </p>
                </div>
              </div>

              {mobileQuery.isLoading ? (
                <p
                  data-ocid="seguimiento.mobile_loading"
                  className="text-sm text-muted-foreground"
                >
                  Buscando tu móvil…
                </p>
              ) : hasMobile ? (
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      Nombre del funcionario
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-medium">
                      {mobile.officialName}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      Identificador de móvil
                    </dt>
                    <dd className="text-currency mt-0.5 text-sm">
                      {mobile.mobileIdentifier}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      Tipo de servicio
                    </dt>
                    <dd className="mt-0.5 truncate text-sm font-medium">
                      {mobile.serviceType}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      Última posición registrada
                    </dt>
                    <dd className="text-currency mt-0.5 text-sm">
                      {mobile.lastLatitude === undefined ||
                      mobile.lastLongitude === undefined
                        ? "Sin datos"
                        : `${mobile.lastLatitude.toFixed(6)}, ${mobile.lastLongitude.toFixed(6)}`}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/60 px-3 py-2.5 sm:col-span-2">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      Última actualización
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium">
                      {mobile.lastUpdate
                        ? `${formatRelative(mobile.lastUpdate)} · ${formatDateTime(mobile.lastUpdate)}`
                        : "Sin datos"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <div
                  data-ocid="seguimiento.no_mobile"
                  className="flex flex-col gap-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3"
                >
                  <div className="flex gap-3">
                    <UserX className="mt-0.5 size-5 shrink-0 text-warning" />
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold text-foreground">
                        Todavía no tenés un móvil vinculado
                      </p>
                      <p className="text-muted-foreground">
                        Ingresá el usuario y la contraseña de tu móvil para
                        vincularlo a tu cuenta. Después, tu ubicación se
                        registrará automáticamente en esta página.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleLinkSubmit}
                    className="flex flex-col gap-3"
                    noValidate
                  >
                    <div className="space-y-2">
                      <Label htmlFor="link-username">Usuario del móvil</Label>
                      <Input
                        id="link-username"
                        name="link-username"
                        autoComplete="username"
                        data-ocid="seguimiento.link_username_input"
                        value={linkUsername}
                        onChange={(event) =>
                          setLinkUsername(event.target.value)
                        }
                        placeholder="usuario del móvil"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="link-password">
                        Contraseña del móvil
                      </Label>
                      <Input
                        id="link-password"
                        name="link-password"
                        type="password"
                        autoComplete="current-password"
                        data-ocid="seguimiento.link_password_input"
                        value={linkPassword}
                        onChange={(event) =>
                          setLinkPassword(event.target.value)
                        }
                        placeholder="••••••••"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    {linkError ? (
                      <p
                        data-ocid="seguimiento.link_error"
                        role="alert"
                        className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
                      >
                        {linkError}
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      data-ocid="seguimiento.link_submit_button"
                      disabled={linkMutation.isPending}
                      className="h-11 rounded-xl bg-gradient-primary shadow-instrument"
                    >
                      <Link2 className="size-4" />
                      {linkMutation.isPending
                        ? "Vinculando…"
                        : "Vincular mi móvil"}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            {geo.isWatching ? (
              <Button
                type="button"
                variant="secondary"
                data-ocid="seguimiento.stop_button"
                onClick={geo.stop}
                className="h-11 rounded-xl"
              >
                <Square className="size-4" />
                Detener registro
              </Button>
            ) : (
              <Button
                type="button"
                data-ocid="seguimiento.start_button"
                onClick={geo.start}
                className="h-11 rounded-xl bg-gradient-primary shadow-instrument"
              >
                <Play className="size-4" />
                Reanudar registro
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
