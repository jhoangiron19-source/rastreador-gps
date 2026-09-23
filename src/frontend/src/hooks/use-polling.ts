import { useEffect, useRef } from "react";

/**
 * Ejecuta `callback` de forma periódica mientras el componente está montado.
 * Se usa para refrescar el mapa y el listado de móviles en tiempo real.
 * El callback se guarda en una ref para no reiniciar el intervalo en cada render.
 */
export function usePolling(
  callback: () => void,
  intervalMs: number,
  enabled = true,
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    const id = window.setInterval(() => {
      callbackRef.current();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
}
