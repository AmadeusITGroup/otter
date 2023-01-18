import { Device } from '@capacitor/device';

/**
 * Type for the 3 capacitor platforms
 */
export type CapacitorPlatforms = 'ios' | 'android' | 'web';


/**
 * Returns the capacitor platform
 */
export async function getCapacitorPlatform(): Promise<CapacitorPlatforms> {
  const info = await Device.getInfo();
  return info.platform;
}

/**
 * Returns true if in a capacitor context (mobile app) or false for web
 */
export async function isCapacitorContext(): Promise<boolean> {
  const platform = await getCapacitorPlatform();
  return (platform === 'ios') || (platform === 'android');
}

/**
 * Returns the baseUrl that can be used depending on the platform
 */
export async function getBaseUrl(): Promise<string> {
  const platform = await getCapacitorPlatform();
  switch (platform) {
    case ('ios'):
      return 'capacitor://localhost';
    case ('android'):
      return 'http://localhost';
    default:
      return window.location.href;
  }
}
