export class FileSystem {
  readdir = vi.fn(() => Promise.resolve([]));
  readFile = vi.fn(() => Promise.resolve());
  watch = vi.fn();
}

export class WebContainerApiMock {
  static boot = vi.fn(() => Promise.resolve({
    on: vi.fn(() => vi.fn()),
    mount: vi.fn(() => Promise.resolve()),
    spawn: vi.fn(() => Promise.resolve({
      exit: Promise.resolve(0),
      input: new WritableStream(),
      output: new ReadableStream({
        start: (controller) => controller.close()
      })
    })),
    fs: new FileSystem()
  }));
}

vi.mock('@webcontainer/api',
  () => ({
    WebContainer: WebContainerApiMock
  }), {
    virtual: true
  });
