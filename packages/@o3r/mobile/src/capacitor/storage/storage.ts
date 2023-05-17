import { Preferences as CapacitorStorage } from '@capacitor/preferences';
import type { AsyncStorage } from '@o3r/store-sync';

/**
 * Capacitor storage
 */
export class OtterCapacitorStorage implements AsyncStorage {
  /**
   * @inheritdoc
   */
  public removeItem(key: string): void {
    void CapacitorStorage.remove({ key });
  }

  /**
   * @inheritdoc
   */
  public setItem(key: string, value: string): void {
    void CapacitorStorage.set({ key, value });
  }

  /**
   * @inheritdoc
   */
  public async getItem(key: string): Promise<string | null> {
    const { value } = await CapacitorStorage.get({ key });
    return value;
  }
}
