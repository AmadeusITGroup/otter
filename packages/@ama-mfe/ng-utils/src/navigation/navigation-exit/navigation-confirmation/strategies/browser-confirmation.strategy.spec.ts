import {
  BrowserConfirmationStrategy,
} from './browser-confirmation.strategy';

describe('BrowserConfirmationStrategy', () => {
  let strategy: BrowserConfirmationStrategy;
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    strategy = new BrowserConfirmationStrategy();
    confirmSpy = jest.spyOn(window, 'confirm');
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it('should call window.confirm with formatted message including reason', async () => {
    confirmSpy.mockReturnValue(true);
    const result = await strategy.confirm('Unsaved order changes');

    expect(confirmSpy).toHaveBeenCalledWith(
      'Unsaved order changes\nDo you want to leave this page?'
    );
    expect(result).toBe(true);
  });

  it('should call window.confirm with default message when no reason provided', async () => {
    confirmSpy.mockReturnValue(false);
    const result = await strategy.confirm();

    expect(confirmSpy).toHaveBeenCalledWith('Do you want to leave this page?');
    expect(result).toBe(false);
  });

  it('should return true when user confirms', async () => {
    confirmSpy.mockReturnValue(true);
    const result = await strategy.confirm('test');
    expect(result).toBe(true);
  });

  it('should return false when user cancels', async () => {
    confirmSpy.mockReturnValue(false);
    const result = await strategy.confirm('test');
    expect(result).toBe(false);
  });
});
