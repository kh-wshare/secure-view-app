import { create } from 'zustand';
import { Camera } from '@/types/domain';
import * as camerasApi from '@/services/api/cameras.api';
import type { CreateCameraInput, UpdateCameraInput } from '@/services/api/cameras.api';
import { ApiError } from '@/services/api/ApiError';
import { loadFavoriteIds, saveFavoriteIds } from './favoritesStorage';

type LoadStatus = 'idle' | 'loading' | 'error';

type CameraStore = {
  cameras: Camera[];
  status: LoadStatus;
  error: string | null;
  favoriteIds: Set<string>;
  loadFavorites: () => Promise<void>;
  fetchCameras: () => Promise<void>;
  fetchCamera: (id: string) => Promise<void>;
  createCamera: (input: CreateCameraInput) => Promise<Camera>;
  updateCamera: (id: string, patch: UpdateCameraInput) => Promise<void>;
  deleteCamera: (id: string) => Promise<void>;
  connectCamera: (id: string) => Promise<void>;
  disconnectCamera: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
  setLastMotion: (cameraId: string, text: string, recent: boolean) => void;
  getById: (id: string) => Camera | undefined;
  reset: () => void;
};

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
}

/**
 * Camera list state, backed by the control plane's `/api/v1/cameras` surface
 * (see ARCHITECTURE.md's "State management" section — this store owns the
 * fetch now instead of seeding from `src/services/mock`; screens didn't need
 * to change since they only ever call the store's hooks).
 */
export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: [],
  status: 'idle',
  error: null,
  favoriteIds: new Set(),

  loadFavorites: async () => {
    const ids = await loadFavoriteIds();
    set((state) => ({
      favoriteIds: ids,
      cameras: state.cameras.map((c) => ({ ...c, favorited: ids.has(c.id) })),
    }));
  },

  fetchCameras: async () => {
    set({ status: 'loading', error: null });
    try {
      const isFavorited = (id: string) => get().favoriteIds.has(id);
      const cameras = await camerasApi.listCameras(isFavorited);
      set({ cameras, status: 'idle' });
    } catch (err) {
      set({ status: 'error', error: errorMessage(err) });
    }
  },

  fetchCamera: async (id) => {
    try {
      const isFavorited = (cid: string) => get().favoriteIds.has(cid);
      const camera = await camerasApi.getCamera(id, isFavorited);
      set((state) => ({
        cameras: state.cameras.some((c) => c.id === id)
          ? state.cameras.map((c) => (c.id === id ? camera : c))
          : [...state.cameras, camera],
      }));
    } catch (err) {
      set({ error: errorMessage(err) });
    }
  },

  createCamera: async (input) => {
    const isFavorited = (id: string) => get().favoriteIds.has(id);
    const camera = await camerasApi.createCamera(input, isFavorited);
    set((state) => ({ cameras: [camera, ...state.cameras] }));
    return camera;
  },

  updateCamera: async (id, patch) => {
    const isFavorited = (cid: string) => get().favoriteIds.has(cid);
    const camera = await camerasApi.updateCamera(id, patch, isFavorited);
    set((state) => ({ cameras: state.cameras.map((c) => (c.id === id ? camera : c)) }));
  },

  deleteCamera: async (id) => {
    await camerasApi.deleteCamera(id);
    set((state) => ({ cameras: state.cameras.filter((c) => c.id !== id) }));
  },

  connectCamera: async (id) => {
    await camerasApi.connectCamera(id);
    await get().fetchCamera(id);
  },

  disconnectCamera: async (id) => {
    await camerasApi.disconnectCamera(id);
    await get().fetchCamera(id);
  },

  toggleFavorite: (id) => {
    set((state) => {
      const next = new Set(state.favoriteIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavoriteIds(next).catch(() => {});
      return {
        favoriteIds: next,
        cameras: state.cameras.map((c) => (c.id === id ? { ...c, favorited: next.has(id) } : c)),
      };
    });
  },

  setLastMotion: (cameraId, text, recent) => {
    set((state) => ({
      cameras: state.cameras.map((c) =>
        c.id === cameraId ? { ...c, lastMotionText: text, motionRecent: recent } : c,
      ),
    }));
  },

  getById: (id) => get().cameras.find((c) => c.id === id),

  reset: () => set({ cameras: [], status: 'idle', error: null }),
}));
