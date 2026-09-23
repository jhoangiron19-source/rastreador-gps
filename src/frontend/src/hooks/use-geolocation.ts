import { useCallback, useEffect, useRef, useState } from "react";

/** Estado del permiso de ubicación del navegador. */
export type GeolocationPermission =
  | "unknown"
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

export interface GeolocationState {
  /** Latitud de la última lectura válida. */
  latitude: number | null;
  /** Longitud de la última lectura válida. */
  longitude: number | null;
  /** Precisión en metros de la última lectura válida. */
  accuracy: number | null;
  /** Momento (ms) en que se obtuvo la última lectura válida. */
  updatedAt: number | null;
  /** Mensaje en español cuando falla la lectura o el permiso. */
  error: string | null;
  /** El navegador está observando la posición. */
  isWatching: boolean;
  /** Estado del permiso de ubicación. */
  permissionState: GeolocationPermission;
  /** Inicia la observación continua de la posición. */
  start: () => void;
  /** Detiene la observación continua de la posición. */
  stop: () => void;
}

const UNSUPPORTED_MESSAGE =
  "Tu navegador no admite la geolocalización. Probá con otro navegador actualizado.";

const DENIED_MESSAGE =
  "Permiso de ubicación denegado. Habilitá el acceso a la ubicación para este sitio en la configuración del navegador y volvé a intentarlo.";

const UNAVAILABLE_MESSAGE =
  "No se pudo obtener la ubicación. Verificá que el GPS esté activo e intentá nuevamente.";

const TIMEOUT_MESSAGE =
  "La ubicación tardó demasiado en responder. Acercate a una ventana o al exterior e intentá nuevamente.";

function messageForError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return DENIED_MESSAGE;
    case error.POSITION_UNAVAILABLE:
      return UNAVAILABLE_MESSAGE;
    case error.TIMEOUT:
      return TIMEOUT_MESSAGE;
    default:
      return UNAVAILABLE_MESSAGE;
  }
}

/**
 * Observa la posición del usuario con `navigator.geolocation.watchPosition`
 * mientras el componente está montado. Expone la última lectura, el estado del
 * permiso y controles para iniciar o detener el registro.
 */
export function useGeolocation(): GeolocationState {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [permissionState, setPermissionState] =
    useState<GeolocationPermission>("unknown");

  const watchIdRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermissionState("unsupported");
      setError(UNSUPPORTED_MESSAGE);
      return;
    }
    if (watchIdRef.current !== null) return;

    setError(null);
    setIsWatching(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setUpdatedAt(Date.now());
        setError(null);
        setPermissionState("granted");
      },
      (positionError) => {
        setError(messageForError(positionError));
        if (positionError.code === positionError.PERMISSION_DENIED) {
          setPermissionState("denied");
          stop();
        }
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    );
  }, [stop]);

  // Consulta el estado del permiso cuando la Permissions API está disponible.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermissionState("unsupported");
      return;
    }
    if (!navigator.permissions?.query) return;

    let cancelled = false;
    let status: PermissionStatus | null = null;

    const handleChange = () => {
      if (status) setPermissionState(status.state as GeolocationPermission);
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        status = result;
        setPermissionState(result.state as GeolocationPermission);
        result.addEventListener("change", handleChange);
      })
      .catch(() => {
        // La Permissions API no está disponible: el permiso se deduce del watch.
      });

    return () => {
      cancelled = true;
      status?.removeEventListener("change", handleChange);
    };
  }, []);

  // Detiene la observación al desmontar el componente.
  useEffect(() => stop, [stop]);

  return {
    latitude,
    longitude,
    accuracy,
    updatedAt,
    error,
    isWatching,
    permissionState,
    start,
    stop,
  };
}
