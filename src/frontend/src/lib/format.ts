import type { Pesos, Timestamp } from "@/backend";

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Convierte un timestamp nanosegundo del backend en Date, o null si es inválido. */
export function timestampToDate(
  timestamp: Timestamp | undefined | null,
): Date | null {
  if (timestamp === undefined || timestamp === null) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formatea un número con separador de miles por punto (estilo argentino). */
export function formatNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Formatea pesos argentinos con separador de miles por punto, p. ej. $2.400. */
export function formatPesos(value: Pesos | number): string {
  const numeric = typeof value === "bigint" ? Number(value) : value;
  return `$${formatNumber(numeric, 0)}`;
}

/** Formatea kilómetros con dos decimales, p. ej. 12,40 km. */
export function formatKm(value: number): string {
  return `${formatNumber(value, 2)} km`;
}

/** Formatea una cantidad de minutos en texto legible, p. ej. 1 h 25 min. */
export function formatMinutes(value: number): string {
  const total = Math.max(0, Math.round(value));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** Formatea fecha y hora en español, p. ej. 22/09/2026, 14:30. */
export function formatDateTime(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  return date ? dateTimeFormatter.format(date) : "Sin datos";
}

/** Formatea solo la fecha en español. */
export function formatDate(timestamp: Timestamp | undefined | null): string {
  const date = timestampToDate(timestamp);
  return date ? dateFormatter.format(date) : "Sin datos";
}

/** Formatea solo la hora en español. */
export function formatTime(timestamp: Timestamp | undefined | null): string {
  const date = timestampToDate(timestamp);
  return date ? timeFormatter.format(date) : "—";
}

/** Devuelve "Hace 2 min" o "Hace 3 h" a partir de un timestamp. */
export function formatRelative(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Sin datos";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "Ahora";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

/** Convierte un texto de entrada en número, tolerando coma decimal. */
export function parseNumberInput(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Convierte un texto de entrada en entero no negativo. */
export function parseIntegerInput(value: string): number {
  const parsed = Math.trunc(parseNumberInput(value));
  return parsed < 0 ? 0 : parsed;
}

/** Diferencia en minutos entre dos horas "HH:MM"; null si el rango es inválido. */
export function minutesBetween(
  arrival: string,
  departure: string,
): number | null {
  const start = parseClock(arrival);
  const end = parseClock(departure);
  if (start === null || end === null) return null;
  const diff = end - start;
  return diff < 0 ? null : diff;
}

function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Formatea una hora "HH:MM" para mostrarla, o "—" si está vacía. */
export function formatClock(value: string): string {
  return value.trim() === "" ? "—" : value;
}
