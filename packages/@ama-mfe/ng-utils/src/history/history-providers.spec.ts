import {
  type HistoryMessage,
} from '@ama-mfe/messages';
import {
  MESSAGE_PEER_CONFIG,
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  ApplicationInitStatus,
} from '@angular/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  provideHistoryOverrides,
} from './history-providers';

/**
 * Build a fresh, fully patchable `History`-like object.
 *
 * `provideHistoryOverrides` redefines `history` members as non-configurable, so
 * every test needs a pristine instance. We build a minimal stand-in here rather
 * than importing `jsdom` directly: jsdom's encoding-sniffer chain ships ESM
 * inside CommonJS packages, which the Vitest (Vite SSR) loader cannot resolve.
 * The Vitest jsdom test environment already provides a DOM; we only need an
 * isolated `history` to patch.
 */
const createFreshHistory = (): History => Object.defineProperties({} as History, {
  pushState: { value: () => {}, writable: true, configurable: true },
  replaceState: { value: () => {}, writable: true, configurable: true },
  back: { value: () => {}, writable: true, configurable: true },
  forward: { value: () => {}, writable: true, configurable: true },
  go: { value: () => {}, writable: true, configurable: true }
});

describe('provideDisableHistoryWrites()', () => {
  const messageServiceMock = {
    send: vi.fn()
  } as const satisfies Partial<MessagePeerService<HistoryMessage>>;
  let originalHistory: History;
  let freshHistory: History;

  beforeEach(async () => {
    freshHistory = createFreshHistory();
    originalHistory = { ...freshHistory };
    // `history` is a getter-only property on the jsdom `window`/`globalThis`;
    // redefine it so each test starts from a pristine, patchable instance.
    Object.defineProperty(globalThis, 'history', {
      value: freshHistory,
      writable: true,
      configurable: true
    });

    TestBed.configureTestingModule({
      providers: [
        provideHistoryOverrides(),
        { provide: MESSAGE_PEER_CONFIG, useValue: {} },
        { provide: MessagePeerService, useValue: messageServiceMock }
      ]
    });

    // waiting for app initializer to run
    await TestBed.inject(ApplicationInitStatus).donePromise;
  });

  afterEach(() => {
    delete (globalThis as any).history;
  });

  it('should patch history.pushState()', () => {
    const { writable, configurable } = Object.getOwnPropertyDescriptor(history, 'pushState');
    expect(history.pushState).not.toBe(originalHistory.pushState);
    expect(writable).toBe(false);
    expect(configurable).toBe(false);
  });

  it('should replaceState instead of pushState', () => {
    const replaceStateSpy = vi.spyOn(history, 'replaceState');
    history.pushState({ data: 1 }, '', 'url');
    expect(replaceStateSpy).toHaveBeenCalledWith({ data: 1 }, '', 'url');
  });

  it('should patch history.back()', () => {
    const { writable, configurable } = Object.getOwnPropertyDescriptor(history, 'back');
    expect(history.back).not.toBe(originalHistory.back);
    expect(writable).toBe(false);
    expect(configurable).toBe(false);
  });

  it('should send message when calling history.back', () => {
    history.back();
    expect(messageServiceMock.send).toHaveBeenCalledWith(expect.objectContaining({
      type: 'history',
      version: '1.0',
      delta: -1
    }));
  });

  it('should patch history.forward()', () => {
    const { writable, configurable } = Object.getOwnPropertyDescriptor(history, 'forward');
    expect(history.forward).not.toBe(originalHistory.forward);
    expect(writable).toBe(false);
    expect(configurable).toBe(false);
  });

  it('should send message when calling history.forward', () => {
    history.forward();
    expect(messageServiceMock.send).toHaveBeenCalledWith(expect.objectContaining({
      type: 'history',
      version: '1.0',
      delta: 1
    }));
  });

  it('should patch history.go()', () => {
    const { writable, configurable } = Object.getOwnPropertyDescriptor(history, 'go');
    expect(history.go).not.toBe(originalHistory.go);
    expect(writable).toBe(false);
    expect(configurable).toBe(false);
  });

  it('should send message when calling history.go', () => {
    history.go(5);
    expect(messageServiceMock.send).toHaveBeenCalledWith(expect.objectContaining({
      type: 'history',
      version: '1.0',
      delta: 5
    }));
  });

  it('should not throw when calling patches', () => {
    expect(() => history.pushState({ data: 1 }, '', 'url')).not.toThrow();
    expect(() => history.back()).not.toThrow();
    expect(() => history.forward()).not.toThrow();
    expect(() => history.go(-1)).not.toThrow();
  });

  it('should not allow re-patching', () => {
    expect(() => Object.defineProperty(history, 'pushState', { value: () => {} })).toThrow();
    expect(() => Object.defineProperty(history, 'back', { value: () => {} })).toThrow();
    expect(() => Object.defineProperty(history, 'forward', { value: () => {} })).toThrow();
    expect(() => Object.defineProperty(history, 'go', { value: () => {} })).toThrow();
  });
});
