/**
 * Mock device for unit testing.
 * Will replace the capacitor plugin in the spec files as specified in tsconfig.spec.json.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed by Capacitor
export const Device = {
  getInfo: () => {
    return Promise.resolve({ platform: undefined });
  }
};
