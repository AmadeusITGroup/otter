import {
  Device,
  DeviceInfo
} from '@capacitor/device';
import {
  CapacitorPlatforms,
  getBaseUrl,
  getCapacitorPlatform,
  isCapacitorContext
} from './helpers';

/**
 * Mock capacitor platform
 * @param platform the device platform: ios, android or web
 */
function setCapacitorPlatform(platform: CapacitorPlatforms) {
  Device.getInfo = jest.fn().mockImplementation((): Partial<DeviceInfo> => ({ platform }));
}

describe('Capacitor helpers', () => {
  describe('setCapacitorPlatform', () => {
    it('should return the capacitor platform', async () => {
      setCapacitorPlatform('ios');

      await expect(getCapacitorPlatform()).resolves.toBe('ios');
    });
  });

  describe('isCapacitorContext', () => {
    it('should identify capacitor context when on ios', async () => {
      setCapacitorPlatform('ios');

      await expect(isCapacitorContext()).resolves.toBe(true);
    });

    it('should identify capacitor context when on android', async () => {
      setCapacitorPlatform('android');

      await expect(isCapacitorContext()).resolves.toBe(true);
    });

    it('should not identify capacitor context when on web', async () => {
      setCapacitorPlatform('web');

      await expect(isCapacitorContext()).resolves.toBe(false);
    });
  });

  describe('getBaseUrl', () => {
    it('should return capacitor schema for ios', async () => {
      setCapacitorPlatform('ios');

      await expect(getBaseUrl()).resolves.toBe('capacitor://localhost');
    });

    it('sshould return http schema for android', async () => {
      setCapacitorPlatform('android');

      await expect(getBaseUrl()).resolves.toBe('http://localhost');
    });
  });
});
