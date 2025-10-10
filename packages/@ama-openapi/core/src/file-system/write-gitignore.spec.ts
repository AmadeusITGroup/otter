import { promises as fs } from 'node:fs';
import { writeGitIgnore } from "./write-gitignore.mjs";

jest.mock('node:fs', () => ({
  promises: {
    writeFile: jest.fn()
  }
}));

describe('writeGitIgnore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
  });

  it('should generate gitignore file ', async () => {
    await writeGitIgnore({dependencyOutput: 'my-folder'} as any);

    expect(fs.writeFile).toHaveBeenCalledWith('my-folder/.gitignore', expect.stringMatching(/^\*$/m), expect.anything());
  });
});
