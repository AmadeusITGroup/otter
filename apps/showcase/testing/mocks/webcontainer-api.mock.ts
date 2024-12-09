export class WebContainerApiMock {
  public static boot = jest.fn(() => Promise.resolve({
    on: jest.fn(() => jest.fn())
  }));
}

jest.mock('@webcontainer/api',
  () => ({
    WebContainer: WebContainerApiMock
  }), {
    virtual: true
  });
