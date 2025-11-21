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
  JSDOM,
} from 'jsdom';
import {
  provideHistoryOverrides,
} from './history.providers';

describe('provideDisableHistoryWrites()', () => {
  let dom: JSDOM;
  const messageServiceMock = {
    send: jest.fn()
  } as const satisfies Partial<MessagePeerService<HistoryMessage>>;
  let originalHistory: typeof window.history;

  beforeEach(async () => {
    dom = new JSDOM('', { url: 'http://example.com/' });
    (global as any).window = dom.window;
    (global as any).history = dom.window.history;
    originalHistory = { ...dom.window.history };

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
    dom.window.close();
    delete (global as any).window;
    delete (global as any).history;
  });

  it('should patch history.pushState()', () => {
    const { writable, configurable } = Object.getOwnPropertyDescriptor(history, 'pushState');
    expect(history.pushState).not.toBe(originalHistory.pushState);
    expect(writable).toBe(false);
    expect(configurable).toBe(false);
  });

  it('should replaceState instead of pushState', () => {
    const replaceStateSpy = jest.spyOn(history, 'replaceState');
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
