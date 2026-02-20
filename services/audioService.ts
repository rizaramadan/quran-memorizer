import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const isWeb = Platform.OS === 'web';
const CACHE_DIR = `${FileSystem.documentDirectory}audio/`;

let sound: Audio.Sound | null = null;
let currentKey: string | null = null;
let audioQueue: Promise<void> = Promise.resolve();

// Web: keep fetched blob URIs in memory
const webCache = new Map<string, string>();

function ayahKey(surah: number, ayah: number) {
  return `${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}`;
}

function remoteUri(surah: number, ayah: number) {
  return `https://everyayah.com/data/Alafasy_128kbps/${ayahKey(surah, ayah)}.mp3`;
}

function localPath(surah: number, ayah: number) {
  return `${CACHE_DIR}${ayahKey(surah, ayah)}.mp3`;
}

export async function isDownloaded(surah: number, ayah: number): Promise<boolean> {
  if (isWeb) return webCache.has(ayahKey(surah, ayah));
  const info = await FileSystem.getInfoAsync(localPath(surah, ayah));
  return info.exists;
}

export async function downloadAyah(
  surah: number,
  ayah: number,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const key = ayahKey(surah, ayah);

  if (isWeb) {
    const cached = webCache.get(key);
    if (cached) return cached;

    const response = await fetch(remoteUri(surah, ayah));
    const reader = response.body?.getReader();
    const contentLength = Number(response.headers.get('content-length') || 0);

    if (reader && contentLength > 0) {
      const chunks: BlobPart[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        onProgress?.(received / contentLength);
      }
      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const blobUrl = URL.createObjectURL(blob);
      webCache.set(key, blobUrl);
      return blobUrl;
    }
    // Fallback: no streaming progress
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    onProgress?.(1);
    webCache.set(key, blobUrl);
    return blobUrl;
  }

  // Native path
  const path = localPath(surah, ayah);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) return path;

  await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  const dl = FileSystem.createDownloadResumable(
    remoteUri(surah, ayah),
    path,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (totalBytesExpectedToWrite > 0 && onProgress) {
        onProgress(totalBytesWritten / totalBytesExpectedToWrite);
      }
    },
  );
  await dl.downloadAsync();
  return path;
}

export function prefetchAyah(surah: number, ayah: number) {
  downloadAyah(surah, ayah).catch(() => {});
}

function runAudioOperation<T>(operation: () => Promise<T>): Promise<T> {
  const next = audioQueue.then(operation, operation);
  audioQueue = next.then(() => undefined, () => undefined);
  return next;
}

export async function playAyah(surah: number, ayah: number) {
  return runAudioOperation(async () => {
    const stateKey = `${surah}:${ayah}`;
    if (stateKey === currentKey && sound) {
      const status = await sound.getStatusAsync().catch(() => null);
      if (status?.isLoaded) {
        await sound.playAsync();
        return;
      }

      // Sound reference is stale; reset and recreate.
      sound = null;
      currentKey = null;
    }
    if (sound) {
      await sound.unloadAsync().catch(() => {});
      sound = null;
      currentKey = null;
    }
    const key = ayahKey(surah, ayah);
    const uri = isWeb ? (webCache.get(key) || remoteUri(surah, ayah)) : localPath(surah, ayah);
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
    );
    sound = newSound;
    currentKey = stateKey;
  });
}

export async function pauseAudio() {
  return runAudioOperation(async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync().catch(() => null);
    if (status?.isLoaded) {
      await sound.pauseAsync();
    }
  });
}
