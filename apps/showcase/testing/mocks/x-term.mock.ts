export class XtermTerminalMock {
  public loadAddon = jest.fn(() => Promise.resolve());
  public open = jest.fn();
  public clear = jest.fn();
  public kill = jest.fn();
  public getWriter = jest.fn();
  public dispose = jest.fn();
  public onWriteParsed = () => ({
    dispose: jest.fn()
  });
}

jest.mock('@xterm/xterm',
  () => ({ Terminal: XtermTerminalMock }), {
    virtual: true
  });
