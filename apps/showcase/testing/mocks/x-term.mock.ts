export class XtermTerminalMock {
  public loadAddon = vi.fn(() => Promise.resolve());
  public open = vi.fn();
  public clear = vi.fn();
  public kill = vi.fn();
  public getWriter = vi.fn();
  public dispose = vi.fn();
  public write = vi.fn();
  public onData = vi.fn(() => ({
    dispose: vi.fn()
  }));

  public onWriteParsed = () => ({
    dispose: vi.fn()
  });
}

vi.mock('@xterm/xterm',
  () => ({ Terminal: XtermTerminalMock }), {
    virtual: true
  });
