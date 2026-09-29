export class FileSystem {
  public readdir = vi.fn(() => Promise.resolve([]));
  public readFile = vi.fn(() => Promise.resolve());
  public watch = vi.fn();
}

export const webContainerApiMock = {
  boot: vi.fn(() => Promise.resolve({
    on: vi.fn(() => vi.fn()),
    mount: vi.fn(() => Promise.resolve()),
    spawn: vi.fn(() => Promise.resolve({
      exit: Promise.resolve(0),
      kill: vi.fn(),
      input: new WritableStream(),
      output: new ReadableStream({
        start: (controller) => controller.close()
      })
    })),
    fs: new FileSystem()
  }))
};

vi.mock('@webcontainer/api',
  () => ({
    WebContainer: webContainerApiMock
  }), {
    virtual: true
  });
