export class FileSystem {
  public readdir = jest.fn(() => Promise.resolve([]));
  public readFile = jest.fn(() => Promise.resolve());
  public watch = jest.fn();
}

export class WebContainerApiMock {
  public static boot = jest.fn(() => Promise.resolve({
    on: jest.fn(() => jest.fn()),
    mount: jest.fn(() => Promise.resolve()),
    fs: new FileSystem()
  }));
}

jest.mock('@webcontainer/api',
  () => ({
    WebContainer: WebContainerApiMock
  }), {
    virtual: true
  });
