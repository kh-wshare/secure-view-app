import { Camera } from '@/types/domain';

/**
 * Mock camera fixtures. Swap this module for a real API-backed data source
 * later — nothing outside `useCameraStore` should import this file directly.
 */
export const mockCameras: Camera[] = [
  {
    id: 'frontdoor',
    name: 'Front Door',
    location: 'Entrance',
    status: 'online',
    recording: true,
    motionRecent: false,
    lastMotionText: 'Motion detected 3m ago',
    favorited: true,
    supportsPtz: false,
    thumbnailGradient: ['#1D3A38', '#0E1B1C'],
  },
  {
    id: 'livingroom',
    name: 'Living Room',
    location: 'Main Floor',
    status: 'online',
    recording: true,
    motionRecent: false,
    lastMotionText: 'No recent motion',
    favorited: false,
    supportsPtz: true,
    thumbnailGradient: ['#22303B', '#0F1519'],
  },
  {
    id: 'garage',
    name: 'Garage',
    location: 'Exterior',
    status: 'online',
    recording: false,
    motionRecent: true,
    lastMotionText: 'Motion detected 3m ago',
    favorited: true,
    supportsPtz: false,
    thumbnailGradient: ['#3A2E1B', '#17130C'],
  },
  {
    id: 'backyard',
    name: 'Backyard',
    location: 'Exterior',
    status: 'online',
    recording: false,
    motionRecent: false,
    lastMotionText: 'No recent motion',
    favorited: false,
    supportsPtz: true,
    thumbnailGradient: ['#242424', '#101010'],
  },
];
