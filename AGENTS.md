# Project Guidance

## User Preferences

- Interfaz completamente en español
- Moneda en pesos argentinos con separador de miles por punto
- Diseño de la calculadora según las capturas: tarjetas blancas redondeadas sobre fondo gris claro, botón principal verde 'Guardar servicio', acento rojo para eliminar domicilios
- Límite de 50 usuarios/móviles
- Tarifas por defecto: bajada de bandera $2.400, km $850, tiempo $170/min, TAG $700

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend timestamps are nanosecond bigints; convert with Number(ts / 1_000_000n) before Date formatting.
- The admin master credentials ('administrador'/20346188) are enforced in the frontend while the backend enforces admin via Internet Identity roles; the real route guard is isCallerAdmin, not the frontend unlock flag.
- Motoko multiline string literals are unsupported by moc 1.16.0; use single-line strings with \n escapes.
- OQL auto-derivation needs an implicit _toRow per field type; records with collections or nested records need .toEntityManual(...).
- pnpm bindgen reads src/backend/dist/backend.did, so mops build must run before bindgen.
- biome check flags organizeImports/format on hand-written files; run pnpm fix before check.
- RouteView.totalKilometers is always 0.0 by design because the Route contract stores no kilometre data.
