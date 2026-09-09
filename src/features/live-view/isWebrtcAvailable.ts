import { NativeModules } from 'react-native';

/**
 * `react-native-webrtc` throws (via an `invariant()` inside its own
 * `EventEmitter.ts`, constructing a `NativeEventEmitter` around the missing
 * native module) the moment it's `require()`-d without its native module
 * linked — which is always true in Expo Go. Metro's dev-mode module loader
 * reports that throw to the LogBox as an "Uncaught Error" even when the
 * `require()` call site is wrapped in try/catch, because module-load errors
 * are surfaced for visibility regardless of whether calling code recovers.
 * The only way to avoid the redbox entirely is to never call
 * `require('react-native-webrtc')` in the first place unless its native
 * module is actually present — checked here as a plain property read, which
 * cannot throw.
 */
export function isWebrtcAvailable(): boolean {
  return NativeModules.WebRTCModule != null;
}
