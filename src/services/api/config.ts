/**
 * Base URLs for the two backend services (see the project's Postman collection):
 * the Go control plane (`/api/v1/*`) and the Rust media gateway (WHEP streaming).
 * Override per-environment with a `.env` (`EXPO_PUBLIC_*` vars are inlined by
 * Expo at build time — see `.env.example`).
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
export const GATEWAY_BASE_URL = process.env.EXPO_PUBLIC_GATEWAY_URL ?? 'http://localhost:8081';
