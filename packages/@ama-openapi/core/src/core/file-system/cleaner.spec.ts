import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import {
  OUTPUT_DIRECTORY,
} from '../../constants.mjs';
import {
  cleanOutputDirectory,
} from './cleaner.mjs';

vi.mock('node:fs', () => ({
  promises: {
    rm: vi.fn()
  }
}));

describe('cleanOutputDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fs.rm as Mock).mockResolvedValue(undefined);
  });

  it('should remove output directory', async () => {
    await cleanOutputDirectory({ cwd: 'my-folder' });

    expect(fs.rm).toHaveBeenCalledWith(resolve(process.cwd(), 'my-folder', OUTPUT_DIRECTORY), expect.objectContaining({ recursive: true }));
  });
});
