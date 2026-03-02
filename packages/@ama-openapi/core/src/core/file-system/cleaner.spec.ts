import {
  promises as fs,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  OUTPUT_DIRECTORY,
} from '../../constants.mjs';
import {
  cleanOutputDirectory,
} from './cleaner.mjs';

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
    await cleanOutputDirectory({ cwd: 'my-folder' });

    expect(fs.rm).toHaveBeenCalledWith(resolve(process.cwd(), 'my-folder', OUTPUT_DIRECTORY), expect.objectContaining({ recursive: true }));
  });
});
