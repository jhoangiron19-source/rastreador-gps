# Design Brief

## Direction

Instrumento de Ruta — a precision instrument for fleet telemetry and hospital-transport fare calculation, built on a light-gray canvas with white cards and one confident route green.

## Tone

Refined industrial/utilitarian: a control-panel calm that reads as trustworthy and exact, never decorative — every surface earns its place.

## Differentiation

Telemetry and money share one visual language: tabular monospace figures, hairline route-grid backdrops, and a pulsing live-status ring make the app feel like a calibrated instrument rather than a generic dashboard.

## Color Palette

| Token      | OKLCH        | Role                                            |
| ---------- | ------------ | ----------------------------------------------- |
| background | 0.968 0.003 250 | light-gray page canvas                          |
| foreground | 0.235 0.022 250 | slate-ink text, bold headings                   |
| card       | 1 0 0        | white instrument cards, inputs, sheets          |
| primary    | 0.62 0.128 155  | route green: CTAs, active status, map routes    |
| accent     | 0.52 0.118 245  | signal blue: map pins, nav active, links        |
| muted      | 0.955 0.006 250 | gray labels, inset panels, secondary buttons    |
| destructive| 0.585 0.208 25  | red circular delete for domicilios              |
| warning    | 0.72 0.148 70   | "Sin señal" amber status pill                   |

## Typography

- Display: Space Grotesk — bold dark section headings, app title, KPI numerals
- Body: Plus Jakarta Sans — labels, paragraphs, table rows, buttons
- Mono: JetBrains Mono — currency ($2.400), km, timestamps, telemetry columns
- Scale: hero `text-3xl md:text-5xl font-bold tracking-tight`, h2 `text-xl md:text-2xl font-bold`, label `text-xs font-semibold uppercase tracking-wider text-muted-foreground`, body `text-sm md:text-base`

## Elevation & Depth

Flat light-gray canvas; depth comes only from layered white cards with 1px `border-border`, `shadow-instrument` at rest and `shadow-instrument-lg` for modals/overlays — no gradients on page backgrounds.

## Structural Zones

| Zone    | Background        | Border     | Notes                                                     |
| ------- | ----------------- | ---------- | --------------------------------------------------------- |
| Header  | `bg-card`         | `border-b` | sticky; logo + role nav; green active indicator           |
| Content | `bg-background`   | —          | admin: map + mobile list split; calculator: single column |
| Sidebar | `bg-sidebar`      | `border-r` | admin nav; desktop only, collapses to top tabs on mobile  |
| Footer  | `bg-muted/40`     | `border-t` | legal/version only; never carries primary actions         |

## Spacing & Rhythm

Page padding `px-4 md:px-8 py-6`; sections stack with `space-y-6`; card internals `p-4 md:p-5` with `space-y-4`; form fields `space-y-1.5` between label and input; mobile calculator caps at `max-w-lg mx-auto`.

## Component Patterns

- Buttons: `rounded-xl`, h-11 md:h-12; primary = green `bg-gradient-primary` + `shadow-instrument`; secondary = `bg-muted`; destructive = red circular icon button `size-9 rounded-full`
- Cards: `rounded-2xl bg-card border border-border shadow-instrument`; section headings bold dark inside the card
- Inputs: `h-11 rounded-xl bg-card border-input`, focus `ring-2 ring-ring`; currency rendered with `text-currency` (mono, tabular)
- Badges: pill `rounded-full text-xs font-semibold`; En línea = green tint, Sin señal = amber tint, neutral = muted

## Motion

- Entrance: `animate-fade-in-up` 0.35s for cards and list rows, staggered 40ms
- Hover: `transition-smooth` 0.3s on buttons/cards; cards lift to `shadow-instrument-lg`
- Decorative: `animate-pulse-ring` on live mobile markers; `animate-slide-in-right` for map detail panels

## Constraints

- Interfaz completamente en español; no English copy in UI
- Pesos argentinos with period thousands separators ($2.400) via `text-currency`
- Calculator must mirror the screenshots: white rounded cards on light-gray page, green "Guardar servicio" CTA, red circular delete for domicilios
- Semantic tokens only — no hex/rgb literals or arbitrary Tailwind color classes in components
- Light mode is primary; dark mode is a tuned companion, not an inversion

## Signature Detail

The "route grid" — a hairline topographic lattice (`bg-route-grid`) behind the map panel and empty states, plus pulsing live-status rings on markers — a spatial-composition detail that ties telemetry to the instrument metaphor.
