import { promises as fs } from 'node:fs';
import { cleanOutputDirectory } from './cleaner.mjs';

jest.mock('node:fs', () => ({
  promises: {
    rm: jest.fn()
  }
}));

describe('cleanOutputDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.rm as jest.Mock).mockResolvedValue(undefined);
  });

  it('should remove output directory', async () => {
    await cleanOutputDirectory({ dependencyOutput: 'my-folder' } as any);

    expect(fs.rm).toHaveBeenCalledWith('my-folder', expect.objectContaining({recursive: true}));
  });
});
