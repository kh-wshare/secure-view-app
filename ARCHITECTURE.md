# Architecture

This document explains how the codebase is organized and the conventions to follow
so the app stays easy to maintain and extend. Read this before adding a screen,
component, or piece of state.

## Guiding principle

**Feature-based folders, with a small shared core.** Code that only one feature
uses lives inside that feature's folder. Code that multiple features share
(design tokens, primitive UI components, domain types, utilities) lives in `src/`
directly. This keeps each feature self-contained and makes it obvious where new
code belongs: "does anything else need this?" — no → put it in the feature; yes →
put it in the shared layer.

## Folder structure

> **Why `src/core/`, not `src/app/`?** Expo's CLI auto-detects *any* directory
> literally named `src/app` (or `app/` at the project root) as an Expo Router
> root — purely by folder name, whether or not the `expo-router` package is
> installed. This project uses React Navigation, not Expo Router, so that
> folder is named `core/` instead to avoid silently opting into router
> detection and the "Using src/app as the root directory for Expo Router"
> log message. Don't reintroduce a top-level `src/app/` folder.

```
src/
  theme/         Design tokens (colors, spacing, radii, typography) + ThemeProvider
  types/         Shared domain types (Camera, SecurityEvent, NotificationItem, ...)
  services/mock/ Fixture data standing in for a real API
  store/         Zustand stores — one per domain concept (cameras, events, notifications)
  utils/         Small pure helper functions (date formatting, event metadata)
  components/    Shared, reusable UI primitives (Button, Card, Icon, ...)
  core/
    navigation/  React Navigation setup: param types, stacks, tab bar, root navigator
    providers/   App-wide provider composition (theme, query client, safe area, etc.)
  features/
    <feature>/
      screens/     Screen components for this feature
      components/  Components used only within this feature
App.tsx          Entry point: font loading + splash screen + <AppProviders><RootNavigator />
```

### Features

Each tab of the app is a feature: `home`, `cameras`, `events`, `notifications`,
`profile`, plus two supporting flows, `live-view` and `add-camera`, and
`recordings` (reached from within the cameras feature). A feature folder holds:

- `screens/` — one file per screen, named `<Name>Screen.tsx`
- `components/` — components specific to that feature (none of the current
  features need this yet, but the folders exist so a feature's own composite
  widgets have an obvious home instead of drifting into `src/components/`)

If a component ends up used by two or more features, promote it to
`src/components/` and export it from `src/components/index.ts`.

## Design tokens (`src/theme/`)

Never hardcode a color, spacing value, radius, or font family in a screen or
component — always read it from `useTheme()`:

```tsx
const { colors, spacing, radii, fontFamily, fontSize } = useTheme();
```

`colors` resolves to the correct dark/light value automatically based on the
current theme mode, so a screen never needs to branch on `mode` itself except
for asset selection (e.g. choosing an icon). Tokens live in `colors.ts`,
`spacing.ts`, `radii.ts`, `typography.ts` and are combined in `ThemeProvider.tsx`,
which also persists the user's light/dark choice via AsyncStorage and defaults to
the system appearance on first launch.

## State management

- **Zustand** (`src/store/`) holds the app's domain state: cameras, events,
  notifications. Each store currently seeds itself from `src/services/mock/`.
  When a real backend exists, replace the mock import inside the store (or move
  fetching into a `useEffect`/React Query call that populates the store) — no
  screen needs to change, since screens only ever call the store's hooks
  (`useCameraStore((s) => s.cameras)`, etc.), never the mock data directly.
- **React Query** (`@tanstack/react-query`) is wired up in `AppProviders` and
  ready to use for server state once there's a real API — prefer it over adding
  ad-hoc `useEffect` fetches to a Zustand store for anything that needs caching,
  retries, or background refetching.
- **Local component state** (`useState`) for anything that's purely UI-local and
  doesn't need to be shared (a form draft, which tab is selected, dialog
  visibility).

Don't reach into `src/services/mock/*` from a screen or component — always go
through the corresponding store, so swapping mock data for a real API later is a
one-file change.

## Navigation (`src/core/navigation/`)

The app uses a five-tab bottom navigator (`MainTabNavigator`), each tab backed by
its own native-stack navigator (`HomeStack`, `CamerasStack`, `EventsStack`,
`NotificationsStack`, `ProfileStack`). Screens reachable from more than one tab
(`LiveView`, `EventDetails`, `CameraSharing`, `QrScanner`) are registered in every
stack that navigates to them — this is the standard React Navigation pattern for
a screen that needs to push onto whichever tab the user is currently on, rather
than escaping to a separate modal-only stack.

All route names and params are typed in `types.ts` — add a new screen by adding
it to the relevant `*StackParamList` first, then to that stack's `<Stack.Screen>`
list, so the whole app stays type-checked end to end
(`navigation.navigate('EventDetails', { eventId })` won't compile with a
mistyped param).

The bottom tab bar itself is a custom component (`FloatingTabBar.tsx`), not
React Navigation's default, to match the floating/blurred pill design from the
Figma file. If the tab set changes, update `TAB_ICON` / `TAB_LABEL` in that file.

## Shared components (`src/components/`)

Every shared component is exported from `src/components/index.ts` — import from
`@/components` rather than deep-importing a component's own file
(`import { Card } from '@/components'`, not
`import { Card } from '@/components/Card/Card'`). This is what lets a component's
internal file move or split without touching every screen that uses it.

Notable ones:

- **`Icon`** — a single SVG-path-based icon set (`src/components/Icon/paths.ts`)
  instead of an icon font, so icons stay crisp and tree-shakeable. Add new icons
  there rather than pulling in a whole icon library for one glyph.
- **`ConfirmationDialog`** — the *only* pattern used for destructive actions
  (remove camera, revoke access, sign out). Never use the native `Alert.alert`
  for these, since it can't be themed and breaks the design system.
- **`ScreenHeader`** — the shared back/title/actions header for stack screens.
- **`EmptyState` / `ErrorState` / `LoadingSkeleton`** — use these for every list
  or data view's empty, error, and loading states rather than ad-hoc markup, so
  those states stay visually consistent app-wide.

## Path aliases

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `babel.config.js` —
if you ever need a new alias, add it in both places, or imports will typecheck
but fail to bundle, or vice versa).

## Adding a new screen — checklist

1. Decide which feature it belongs to (or create a new `src/features/<name>/`
   folder with a `screens/` subfolder).
2. Add the route + params to the relevant `*StackParamList` in
   `src/core/navigation/types.ts`.
3. Register the screen component in that stack file
   (`src/core/navigation/<X>Stack.tsx`).
4. Build the screen using `useTheme()` for all styling and existing shared
   components from `@/components` wherever they fit, rather than rebuilding a
   button/card/badge/dialog from scratch.
5. If the screen needs data, read it from an existing store, or add a new
   Zustand store under `src/store/` following the existing pattern (mock-backed
   for now, swappable for a real API later).

## Testing & tooling

- `npm run typecheck` — TypeScript strict mode, no `any` implicitly.
- `npm run lint` — ESLint (flat config, `eslint.config.js`). The React Compiler
  diagnostic rules bundled into `eslint-plugin-react-hooks`'s "recommended"
  preset (`refs`, `purity`, `set-state-in-effect`, etc.) are intentionally left
  off — this project doesn't use the React Compiler, and those rules flag
  idiomatic React Native patterns (e.g. `useRef(new Animated.Value(...))`) as
  errors. `rules-of-hooks` and `exhaustive-deps` stay on.
- `npm run format` — Prettier.

Run all three before opening a PR; CI (once configured) should run the same.
