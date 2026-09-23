import type {
  Domicilio,
  Kilometers,
  Minutes,
  MobileId,
  MobileInput,
  MobilePositionView,
  MobileStatus,
  MobileUpdate,
  MobileView,
  Pesos,
  Position,
  Rates,
  RouteFilter,
  RouteId,
  RouteInput,
  RouteView,
  Service,
  ServiceBreakdown,
  ServiceId,
  ServiceInput,
  ServiceSummary,
  Timestamp,
} from "@/backend";

export type {
  Domicilio,
  Kilometers,
  Minutes,
  MobileId,
  MobileInput,
  MobilePositionView,
  MobileStatus,
  MobileUpdate,
  MobileView,
  Pesos,
  Position,
  Rates,
  RouteFilter,
  RouteId,
  RouteInput,
  RouteView,
  Service,
  ServiceBreakdown,
  ServiceId,
  ServiceInput,
  ServiceSummary,
  Timestamp,
};

/** Máximo de móviles que admite el sistema. */
export const MAX_MOBILES = 50;

/** Credenciales del administrador maestro, verificadas en el frontend. */
export const ADMIN_USERNAME = "administrador";
export const ADMIN_PASSWORD = "20346188";

/** Tarifas por defecto usadas cuando el backend aún no responde. */
export const DEFAULT_RATES: Rates = {
  bajadaDeBandera: 2400n,
  porKilometro: 850n,
  porMinuto: 170n,
  porTag: 700n,
};

/** Un móvil se considera "sin señal" tras este tiempo sin actualizar. */
export const STALE_AFTER_MS = 5 * 60 * 1000;

/** Intervalo de refresco para el mapa y el listado de móviles. */
export const POLL_INTERVAL_MS = 15_000;

export interface DomicilioDraft {
  address: string;
  arrivalTime: string;
  departureTime: string;
}

export interface ServiceDraft {
  officialName: string;
  waitMinutes: string;
  kmStart: string;
  kmEnd: string;
  tagCount: string;
  domicilios: DomicilioDraft[];
}

export function emptyDomicilio(): DomicilioDraft {
  return { address: "", arrivalTime: "", departureTime: "" };
}

export function emptyServiceDraft(): ServiceDraft {
  return {
    officialName: "",
    waitMinutes: "",
    kmStart: "",
    kmEnd: "",
    tagCount: "0",
    domicilios: [],
  };
}
