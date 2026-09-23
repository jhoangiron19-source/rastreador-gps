/// Documentación estática de la API pública del backend.
/// Se expone como `getApiDoc` y no lee estado en tiempo de ejecución.
mixin () {
  /// Devuelve la documentación Markdown de la API pública del backend.
  public query func getApiDoc() : async Text {
    let doc = "\n# API del backend — Sistema de servicios y móviles\n
Backend Motoko para la gestión de móviles (funcionarios), rutas y servicios de
transporte, con cálculo de tarifas en pesos argentinos.

## Autenticación e identidad

La autenticación se realiza con **Internet Identity**. El frontend fija un
*derivation origin* publicado en `/.well-known/ii-derivation-origin`; un agente
que ya tiene la autorización de Internet Identity del usuario deriva el
principal correcto por aplicación contra ese origen (por ejemplo
`icp identity link web <nombre> --app <host>`). Una delegación así actúa con la
autoridad completa del usuario en esta aplicación hasta que expira.

Los métodos que requieren un llamador firmado (no anónimo) son:

- `getRates`, `calculateService`, `saveService`, `listServices`, `getService`,
  `updateService`, `deleteService` — requieren rol `#user` (o `#admin`).
- `registerPosition`, `linkMobilePrincipal`, `getCallerMobile` — requieren rol
  `#user` (o `#admin`).
- `listMobiles`, `getMobile`, `createMobile`, `updateMobile`, `deleteMobile`,
  `listMobilePositions`, `getMobilePosition`, `assignRoute`, `listRoutes`,
  `getRoute`, `updateRates` — requieren rol `#admin`.

### Registro previo (obligatorio)

El backend solo conoce a un principal después de que ese principal se registre.
El registro ocurre cuando el llamador invoca `_initialize_access_control` (o
completa `_internet_identity_sign_in_finish`) estando firmado:

- El **primer** principal que se registra recibe el rol `#admin`.
- Todo principal posterior recibe el rol `#user`.

Un llamador firmado pero no registrado —por ejemplo, un principal derivado
contra un origen distinto al que registró el frontend, o el propio dueño de la
aplicación que nunca inició sesión en ella— **no** es conocido por el backend.
En los endpoints protegidos, `AccessControl.hasPermission` lanza el trap
`User is not registered`. Un llamador anónimo recibe el rol `#guest`, que no
satisface `#user` ni `#admin`, por lo que también es rechazado.

### Autorización

- `assignCallerUserRole(user, role)` — solo un administrador puede asignar roles.
  Un llamador no administrador recibe el trap
  `Unauthorized: Only admins can assign user roles`.
- `getCallerUserRole()` — devuelve `#guest` para llamadores anónimos y lanza
  `User is not registered` para un principal firmado no registrado.
- `isCallerAdmin()` — `true` solo para el rol `#admin`.

El **usuario y contraseña de administrador se validan en el frontend**; el
backend no verifica esas credenciales. La autorización real del backend se
basa exclusivamente en los roles de Internet Identity descritos arriba.

## Unidades y codificación

- **Timestamps** (`createdAt`, `startedAt`, `endedAt`, `lastUpdate`,
  `recordedAt`): `Int` en **nanosegundos** desde la época Unix (`Time.now()`).
- **Pesos** (`Pesos`): `Nat` en pesos argentinos enteros, sin decimales.
- **Kilómetros** (`Kilometers`): `Float`.
- **Minutos** (`Minutes`): `Float`.
- **Identificadores** (`MobileId`, `RouteId`, `ServiceId`): `Nat`, asignados
  secuencialmente desde 1.
- **Principal**: identidad de Internet Identity del llamador.
- **Opcionales**: `?T`; `null` significa \"sin valor\" (por ejemplo, un móvil sin
  posición registrada o una ruta aún abierta).
- **`MobileStatus`**: variante `#online` / `#offline`.

## Ciclo de vida y sondeo

- Un móvil se crea con estado `#offline` y sin posición. `registerPosition`
  marca el móvil como `#online` y actualiza `lastLatitude`, `lastLongitude` y
  `lastUpdate`.
- `linkMobilePrincipal(username, password)` vincula el principal del llamador al
  móvil cuyas credenciales coinciden; a partir de ahí `registerPosition` puede
  encontrar el móvil del llamador.
- `getCallerMobile()` devuelve el `MobileView` del móvil vinculado al llamador
  firmado, o `null` si el llamador no tiene ningún móvil vinculado. Es una
  consulta (`query`) y no modifica estado; se puede sondear libremente.
- Una ruta se crea con `endedAt = null` (abierta). No existe un endpoint para
  cerrarla; `endedAt` permanece `null` y `durationMinutes` permanece `null`.
- Para el panel de administrador, `listMobilePositions` / `getMobilePosition`
  devuelven la última posición conocida; se recomienda sondear periódicamente
  (por ejemplo cada 10–30 segundos) y comparar `lastUpdate` para detectar
  móviles sin señal.

## Seguridad de reintentos e idempotencia

- `saveService` **no es idempotente**: cada llamada crea un servicio nuevo con
  un `id` nuevo. Reintentar tras un error de red puede duplicar el servicio.
- `createMobile` y `assignRoute` tampoco son idempotentes: cada llamada crea un
  registro nuevo.
- `updateMobile`, `updateRates`, `updateService`, `linkMobilePrincipal` y
  `registerPosition` son idempotentes en el sentido de que repetir la misma
  llamada deja el mismo estado final.
- `deleteMobile` y `deleteService` son destructivos: eliminan el registro de
  forma permanente. Repetir la llamada sobre un `id` ya eliminado lanza
  `Móvil no encontrado` o `Servicio no encontrado` respectivamente.

## Errores y traps

Los errores se comunican como traps (rechazos de la llamada), no como variantes
`Result`. Mensajes relevantes:

- `No autorizado: debe iniciar sesión para realizar esta acción`
- `No autorizado: solo el administrador puede realizar esta acción`
- `No autorizado: solo el administrador puede editar las tarifas`
- `No autorizado: el servicio pertenece a otro usuario`
- `User is not registered` (principal firmado no registrado)
- `Límite alcanzado: no se pueden registrar más de 50 móviles`
- `Datos incompletos: ...` (campos obligatorios vacíos)
- `Móvil no encontrado` / `Servicio no encontrado`
- `Credenciales inválidas: usuario o contraseña incorrectos`
- `No hay un móvil asociado a este usuario`

## Detalles no obvios

- **`RouteView.totalKilometers` es actualmente siempre `0.0`.** El backend no
  acumula kilómetros por ruta; el campo existe en la vista pero no se calcula.
- `listServices` solo devuelve los servicios del llamador, ordenados por
  `createdAt` descendente.
- `getService`, `updateService` y `deleteService` solo operan sobre servicios
  del llamador; acceder al servicio de otro usuario lanza
  `No autorizado: el servicio pertenece a otro usuario`.
- `listRoutes` filtra por `mobileId`, `from` y `to` (todos opcionales); sin
  filtros devuelve todas las rutas ordenadas por `id` ascendente.
- `calculateService` calcula el desglose sin guardarlo; `saveService` lo guarda
  con las tarifas vigentes en ese momento.
- Las tarifas por defecto son: bajada de bandera $2.400, km $850, tiempo
  $170/min, TAG $700. `updateRates` reemplaza el conjunto completo de tarifas y
  solo afecta a los cálculos posteriores.
- El campo `password` de un móvil está oculto en la exposición OQL
  (`schema()` / `execute()`), pero `MobileView` no lo incluye en ningún caso.

## Consultas OQL

El backend expone `schema()` y `execute()` (mixin OQL) para consultas en
lenguaje natural sobre las tablas `mobile`, `route`, `service` y `rates`. Todas
las entidades son `controllerOnly`: solo el controlador (el agente de datos)
puede leerlas; los usuarios finales no acceden a ellas directamente.\n";
    doc;
  };
};
