import { create } from 'zustand';
import { Camera } from '@/types/domain';
import { mockCameras } from '@/services/mock/cameras.mock';

type CameraStore = {
  cameras: Camera[];
  toggleFavorite: (id: string) => void;
  getById: (id: string) => Camera | undefined;
};

/**
 * Camera list state. Backed by mock data for now — when a real API exists,
 * replace the initial state with a fetch in a useEffect (or move to React
 * Query) without touching any screen that consumes this store.
 */
export const useCameraStore = create<CameraStore>((set, get) => ({
  cameras: mockCameras,
  toggleFavorite: (id) =>
    set((state) => ({
      cameras: state.cameras.map((c) => (c.id === id ? { ...c, favorited: !c.favorited } : c)),
    })),
  getById: (id) => get().cameras.find((c) => c.id === id),
}));
