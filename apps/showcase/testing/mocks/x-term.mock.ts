export class XtermTerminalMock {
  loadAddon = vi.fn(() => Promise.resolve());
  open = vi.fn();
  clear = vi.fn();
  kill = vi.fn();
  getWriter = vi.fn();
  dispose = vi.fn();
  onWriteParsed = () => ({
    dispose: vi.fn()
  });
}

vi.mock('@xterm/xterm',
  () => ({ Terminal: XtermTerminalMock }), {
    virtual: true
  });
