import type {
  Mock,
} from 'vitest';
import {
  createOutputFolder,
} from './create-output-folder';

let mkdirMock: Mock = vi.fn().mockResolvedValue(undefined);
const options = {
  logger: {
    warn: vi.fn()
  }
};

vi.mock('node:fs/promises', () => ({
  mkdir: (...args: any[]) => mkdirMock(...args)
}));

describe('createOutputFolder', () => {
  it('should create a folder', async () => {
    mkdirMock = vi.fn().mockResolvedValue(undefined);
    await createOutputFolder('my/path', options);
    expect(mkdirMock).toHaveBeenCalledWith('my/path', { recursive: true });
    expect(options.logger.warn).not.toHaveBeenCalledWith();
  });

  it('should log exception', async () => {
    mkdirMock = vi.fn().mockRejectedValue(undefined);
    await expect(createOutputFolder('my/path')).resolves.not.toThrow();
    expect(options.logger.warn).not.toHaveBeenCalled();
  });
});
