import { useEffect, useRef, useState } from 'react';
import type {
  MediaStream as MediaStreamType,
  RTCPeerConnection as RTCPeerConnectionType,
  RTCSessionDescription as RTCSessionDescriptionType,
} from 'react-native-webrtc';
import { startStream, stopStream } from '@/services/api/cameras.api';
import { ApiError } from '@/services/api/ApiError';
import { isWebrtcAvailable } from '../isWebrtcAvailable';

export type WhepStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'unavailable';

/**
 * `react-native-webrtc`'s published `lib/typescript` build (checked at
 * v124.0.8) is missing its vendored `event-target-shim` declaration files,
 * so `RTCPeerConnection`'s inherited `addEventListener`/`removeEventListener`
 * don't type-check even though they exist at runtime. This narrow local type
 * fills that gap instead of reaching for `any` everywhere below.
 */
type PeerConnection = InstanceType<typeof RTCPeerConnectionType> & {
  addEventListener(type: 'track', listener: (event: { streams: MediaStreamType[] }) => void): void;
  addEventListener(type: 'icegatheringstatechange', listener: () => void): void;
  removeEventListener(type: 'icegatheringstatechange', listener: () => void): void;
};

/**
 * `react-native-webrtc` registers a native module binding as soon as it's
 * imported, which throws immediately in Expo Go (no native module present).
 * A static top-level `import` would crash the *entire* app at boot, since
 * every screen in a stack navigator is imported eagerly regardless of
 * whether it's ever rendered. `require()` inside a function only runs when
 * that function is actually called, so wrapping it here defers loading
 * until a viewer actually opens Live View — and the try/catch turns a
 * missing native module into a graceful "unavailable" status instead of a
 * crash. This only works on a custom dev client (`npx expo prebuild` +
 * native build); it will never succeed inside Expo Go itself.
 */
function loadWebrtc(): {
  RTCPeerConnection: typeof RTCPeerConnectionType;
  RTCSessionDescription: typeof RTCSessionDescriptionType;
} | null {
  if (!isWebrtcAvailable()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-webrtc');
  } catch {
    return null;
  }
}

/**
 * Negotiates a WHEP (WebRTC-HTTP Egress Protocol) viewing session against the
 * media gateway: `POST /api/v1/cameras/{id}/stream` (control plane) mints a
 * short-lived `stream_token` + `webrtc_url`, then this hook does the actual
 * SDP offer/answer exchange with the gateway's `POST /whep/{session_id}`.
 *
 * WHEP is viewer-only (recvonly) by spec — there is no ingress path for the
 * phone's own microphone here, so LiveViewScreen's "Mic" control stays local
 * UI only; "Speaker" is real (it enables/disables the received audio track).
 */
export function useWhepStream(cameraId: string, enabled: boolean) {
  const [status, setStatus] = useState<WhepStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStreamType | null>(null);
  const pcRef = useRef<PeerConnection | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let sessionCameraId: string | null = null;

    (async () => {
      setStatus('connecting');
      setError(null);

      const webrtc = loadWebrtc();
      if (!webrtc) {
        setStatus('unavailable');
        return;
      }
      const { RTCPeerConnection, RTCSessionDescription } = webrtc;

      try {
        const session = await startStream(cameraId);
        if (cancelled) return;
        sessionCameraId = cameraId;

        const pc = new RTCPeerConnection({ iceServers: session.ice_servers }) as PeerConnection;
        pcRef.current = pc;

        pc.addEventListener('track', (event) => {
          setRemoteStream(event.streams[0] ?? null);
        });

        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        const offer = await pc.createOffer({});
        await pc.setLocalDescription(offer);
        await waitForIceGatheringComplete(pc);

        const localSdp = pc.localDescription?.sdp ?? offer.sdp;
        const res = await fetch(session.webrtc_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
            Authorization: `Bearer ${session.stream_token}`,
          },
          body: localSdp,
        });

        if (!res.ok) {
          throw new Error(`The camera gateway rejected the stream (status ${res.status}).`);
        }

        const answerSdp = await res.text();
        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp: answerSdp }),
        );

        if (!cancelled) setStatus('connected');
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setError(
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Unable to start the live stream.',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      pcRef.current?.close();
      pcRef.current = null;
      setRemoteStream(null);
      if (sessionCameraId) {
        stopStream(sessionCameraId).catch(() => {});
      }
    };
  }, [cameraId, enabled]);

  return { status, error, remoteStream };
}

function waitForIceGatheringComplete(pc: PeerConnection, timeoutMs = 2000): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      pc.removeEventListener('icegatheringstatechange', check);
      resolve();
    }, timeoutMs);
    function check() {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timeout);
        pc.removeEventListener('icegatheringstatechange', check);
        resolve();
      }
    }
    pc.addEventListener('icegatheringstatechange', check);
  });
}
