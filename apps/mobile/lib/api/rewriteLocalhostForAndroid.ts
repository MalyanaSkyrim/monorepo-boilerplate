import { Platform } from 'react-native';

/**
 * The Android emulator cannot reach services on the host machine via `localhost` or
 * `127.0.0.1` — those refer to the emulator itself. Use `10.0.2.2` to reach the host.
 *
 * When `.env` sets EXPO_PUBLIC_API_*_URL to http://localhost:..., we still need this
 * rewrite or every request fails with "Network request failed".
 *
 * Physical devices: use your machine's LAN IP in env (e.g. http://192.168.1.x:4000);
 * `10.0.2.2` only works on the official emulator.
 */
export function rewriteLocalhostForAndroid(url: string): string {
  if (Platform.OS !== 'android') {
    return url;
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      parsed.hostname = '10.0.2.2';
      return parsed.href;
    }
  } catch {
    return url;
  }
  return url;
}
