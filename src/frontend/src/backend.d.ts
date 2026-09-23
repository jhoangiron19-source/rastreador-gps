import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface Domicilio {
    arrivalTime: string;
    departureTime: string;
    timeAtDomicile: Minutes;
    address: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type Kilometers = number;
export type Minutes = number;
export type MobileId = bigint;
export interface MobileInput {
    serviceType: string;
    username: string;
    password: string;
    officialName: string;
    mobileIdentifier: string;
}
export interface MobilePositionView {
    id: MobileId;
    status: MobileStatus;
    latitude?: number;
    lastUpdate?: Timestamp;
    officialName: string;
    longitude?: number;
    mobileIdentifier: string;
}
export interface MobileUpdate {
    serviceType: string;
    username: string;
    password?: string;
    officialName: string;
    mobileIdentifier: string;
}
export interface MobileView {
    id: MobileId;
    status: MobileStatus;
    serviceType: string;
    username: string;
    lastUpdate?: Timestamp;
    officialName: string;
    lastLatitude?: number;
    lastLongitude?: number;
    mobileIdentifier: string;
}
export type Pesos = bigint;
export interface Position {
    latitude: number;
    recordedAt: Timestamp;
    longitude: number;
}
export interface Rates {
    porMinuto: Pesos;
    porKilometro: Pesos;
    bajadaDeBandera: Pesos;
    porTag: Pesos;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface RouteFilter {
    to?: Timestamp;
    from?: Timestamp;
    mobileId?: MobileId;
}
export type RouteId = bigint;
export interface RouteInput {
    serviceType: string;
    mobileId: MobileId;
    officialName: string;
}
export interface RouteView {
    id: RouteId;
    serviceType: string;
    startedAt: Timestamp;
    endedAt?: Timestamp;
    mobileId: MobileId;
    officialName: string;
    durationMinutes?: Minutes;
    totalKilometers: Kilometers;
}
export interface Service {
    id: ServiceId;
    kmStart: Kilometers;
    total: Pesos;
    owner: Principal;
    breakdown: ServiceBreakdown;
    createdAt: Timestamp;
    domicilios: Array<Domicilio>;
    waitMinutes: Minutes;
    officialName: string;
    kmTraveled: Kilometers;
    tagCount: bigint;
    kmEnd: Kilometers;
}
export interface ServiceBreakdown {
    total: Pesos;
    kilometros: Kilometers;
    minutos: Minutes;
    importeTag: Pesos;
    cantidadTag: bigint;
    bajadaDeBandera: Pesos;
    importeKilometros: Pesos;
    importeTiempo: Pesos;
}
export type ServiceId = bigint;
export interface ServiceInput {
    kmStart: Kilometers;
    domicilios: Array<Domicilio>;
    waitMinutes: Minutes;
    officialName: string;
    tagCount: bigint;
    kmEnd: Kilometers;
}
export interface ServiceSummary {
    id: ServiceId;
    total: Pesos;
    createdAt: Timestamp;
    minutes: Minutes;
    officialName: string;
    kmTraveled: Kilometers;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum MobileStatus {
    offline = "offline",
    online = "online"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Asigna una ruta a un móvil (solo administrador).
     */
    assignRoute(input: RouteInput): Promise<RouteView>;
    /**
     * / Calcula el desglose de un servicio sin guardarlo (usuario firmado).
     */
    calculateService(input: ServiceInput): Promise<ServiceBreakdown>;
    /**
     * / Crea un móvil; rechaza el número 51 con error en español (solo administrador).
     */
    createMobile(input: MobileInput): Promise<MobileView>;
    /**
     * / Elimina un móvil existente (solo administrador).
     */
    deleteMobile(id: MobileId): Promise<void>;
    /**
     * / Elimina un servicio guardado (usuario firmado).
     */
    deleteService(id: ServiceId): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Devuelve la documentación Markdown de la API pública del backend.
     */
    getApiDoc(): Promise<string>;
    /**
     * / Devuelve el móvil vinculado al llamador firmado, o null si no tiene ninguno.
     */
    getCallerMobile(): Promise<MobileView | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Obtiene un móvil por identificador (solo administrador).
     */
    getMobile(id: MobileId): Promise<MobileView | null>;
    /**
     * / Detalle de la última posición de un móvil (solo administrador).
     */
    getMobilePosition(id: MobileId): Promise<MobilePositionView | null>;
    /**
     * / Obtiene las tarifas vigentes (usuario firmado).
     */
    getRates(): Promise<Rates>;
    /**
     * / Detalle de una ruta (solo administrador).
     */
    getRoute(id: RouteId): Promise<RouteView | null>;
    /**
     * / Detalle de un servicio guardado (usuario firmado).
     */
    getService(id: ServiceId): Promise<Service | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Vincula el principal del llamador al móvil con las credenciales indicadas (usuario firmado).
     */
    linkMobilePrincipal(username: string, password: string): Promise<MobileView>;
    /**
     * / Última posición conocida de cada móvil (solo administrador).
     */
    listMobilePositions(): Promise<Array<MobilePositionView>>;
    /**
     * / Lista los móviles (solo administrador).
     */
    listMobiles(): Promise<Array<MobileView>>;
    /**
     * / Consulta recorridos filtrados por móvil y rango de fechas (solo administrador).
     */
    listRoutes(filter: RouteFilter): Promise<Array<RouteView>>;
    /**
     * / Lista los servicios guardados del usuario (usuario firmado).
     */
    listServices(): Promise<Array<ServiceSummary>>;
    /**
     * / Registra la posición GPS del móvil del usuario firmado.
     */
    registerPosition(latitude: number, longitude: number): Promise<Position>;
    /**
     * / Guarda un servicio calculado (usuario firmado).
     */
    saveService(input: ServiceInput): Promise<Service>;
    schema(): Promise<string>;
    /**
     * / Edita un móvil existente (solo administrador).
     */
    updateMobile(id: MobileId, input: MobileUpdate): Promise<MobileView>;
    /**
     * / Actualiza las tarifas aplicadas a los cálculos siguientes (solo administrador).
     */
    updateRates(input: Rates): Promise<Rates>;
    /**
     * / Edita un servicio guardado (usuario firmado).
     */
    updateService(id: ServiceId, input: ServiceInput): Promise<Service>;
}
