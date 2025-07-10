import {
  createOutputFolder,
} from './create-output-folder';

let mkdirMock: jest.Mock = jest.fn().mockResolvedValue(undefined);
const options = {
  logger: {
    warn: jest.fn()
  }
};

jest.mock('node:fs/promises', () => ({
  mkdir: (...args: any[]) => mkdirMock(...args)
}));

describe('createOutputFolder', () => {
  it('should create a folder', async () => {
    mkdirMock = jest.fn().mockResolvedValue(undefined);
    await createOutputFolder('my/path', options);
    expect(mkdirMock).toHaveBeenCalledWith('my/path', { recursive: true });
    expect(options.logger.warn).not.toHaveBeenCalledWith();
  });

  it('should log exception', async () => {
    mkdirMock = jest.fn().mockRejectedValue(undefined);
    await expect(createOutputFolder('my/path')).resolves.not.toThrow();
    expect(options.logger.warn).not.toHaveBeenCalled();
  });
});
