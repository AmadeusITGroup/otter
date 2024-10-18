/**
 * Mock device for unit testing.
 * Will replace the capacitor plugin in the spec files as specified in tsconfig.spec.json.
 */
export const Device = {
  async getInfo(): Promise<{ platform: string | undefined }> {
    return { platform: undefined };
  },
};
