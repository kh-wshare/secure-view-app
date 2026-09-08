# SecureView

A mobile security camera (CCTV) companion app for iOS and Android — dashboard, live
camera view, event history, notifications, and camera sharing. Built with
[Expo](https://expo.dev) + React Native + TypeScript.

This project was scaffolded from a Figma design and an implementation spec; see
[`ARCHITECTURE.md`](./ARCHITECTURE.md) for how the codebase is organized and the
conventions to follow when extending it.

## Tech stack

- **Expo (SDK 57)** + React Native 0.87 + React 19, TypeScript in strict mode
- **React Navigation** (bottom tabs + native stack) for navigation
- **Zustand** for local app state (cameras, events, notifications)
- **TanStack React Query** — installed and wired via `AppProviders`, ready for real
  API calls once a backend exists (nothing uses it yet; state is mock-data-backed)
- **react-native-svg** for the icon system, **react-native-reanimated** +
  **react-native-gesture-handler** for animation/gestures
- **expo-camera**, **expo-secure-store**, **expo-notifications**, **expo-blur**,
  **expo-linear-gradient** for camera/QR scanning, secure storage, push
  notifications, and visual effects
- **@expo-google-fonts** (Space Grotesk, Manrope, IBM Plex Mono) for the type system

## Getting started

```bash
npm install
npm run start      # then press i / a to open iOS Simulator / Android Emulator
```

Other scripts:

```bash
npm run ios         # start + open iOS Simulator directly
npm run android      # start + open Android Emulator directly
npm run typecheck   # tsc --noEmit
npm run lint         # eslint .
npm run format       # prettier --write .
```

## Project status

All data in the app currently comes from `src/services/mock/*` fixtures via Zustand
stores (`src/store/`) — there is no backend integration yet. Screens, navigation,
and the full shared component/design-token system are in place and match the
Figma design system. See `ARCHITECTURE.md` for what to do when a real API is ready.

## Requirements

- Node.js 20+
- Expo Go app (for quick device testing) or Xcode / Android Studio for simulators
