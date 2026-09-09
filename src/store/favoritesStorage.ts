import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'secureview.favoriteCameraIds';

/**
 * The API has no "favorite camera" concept, so this preference is kept
 * client-side (AsyncStorage, not SecureStore — it's a UI preference, not
 * credential material) and merged into cameras fetched from the API.
 */
export async function loadFavoriteIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export async function saveFavoriteIds(ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
}
