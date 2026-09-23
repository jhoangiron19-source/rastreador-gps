import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";

/** Acceso: inicio de sesión con Internet Identity y credenciales de administrador. */
export default function AccesoPage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login, unlockAdmin } =
    useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAdminSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (username.trim() === "" || password === "") {
      setError("Ingresá el usuario y la contraseña del administrador.");
      return;
    }
    if (unlockAdmin(username, password)) {
      setError(null);
      void navigate({ to: "/admin" });
      return;
    }
    setError(
      "Usuario o contraseña incorrectos. Verificá los datos e intentá nuevamente.",
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 py-8">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Acceso
        </h1>
        <p className="text-sm text-muted-foreground">
          Iniciá sesión para registrar tu ubicación y consultar tus servicios.
        </p>
      </div>

      <Card
        data-ocid="acceso.card"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardContent className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <LogIn className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold tracking-tight">
                Sesión de usuario
              </p>
              <p className="text-sm text-muted-foreground">
                Usá Internet Identity para identificarte.
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <p
              data-ocid="acceso.session_active"
              className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground"
            >
              Ya tenés una sesión activa. Podés continuar a tu seguimiento.
            </p>
          ) : (
            <Button
              type="button"
              data-ocid="acceso.login_button"
              onClick={() => login()}
              disabled={isInitializing || isLoggingIn}
              className="h-11 rounded-xl bg-gradient-primary shadow-instrument"
            >
              <LogIn className="size-4" />
              {isLoggingIn
                ? "Ingresando…"
                : "Iniciar sesión con Internet Identity"}
            </Button>
          )}

          {isAuthenticated ? (
            <Button
              asChild
              variant="secondary"
              data-ocid="acceso.continue_button"
              className="h-11 rounded-xl"
            >
              <a href="/seguimiento">Ir a mi seguimiento</a>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card
        data-ocid="acceso.admin_card"
        className="rounded-2xl border-border shadow-instrument"
      >
        <CardContent className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold tracking-tight">
                Administrador
              </p>
              <p className="text-sm text-muted-foreground">
                Ingresá las credenciales del administrador maestro.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAdminSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="admin-username">Usuario</Label>
              <Input
                id="admin-username"
                name="username"
                autoComplete="username"
                data-ocid="acceso.username_input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="administrador"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                data-ocid="acceso.password_input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl"
              />
            </div>

            {error ? (
              <p
                data-ocid="acceso.error_state"
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-foreground"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              data-ocid="acceso.admin_submit_button"
              className="h-11 rounded-xl bg-gradient-primary shadow-instrument"
            >
              <KeyRound className="size-4" />
              Ingresar como administrador
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
