/* eslint-disable jest/no-standalone-expect -- some checks in beforeEach */
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
  noop,
  provideDisableHistoryWrites,
} from './history-providers';

describe('provideDisableHistoryWrites()', () => {
  let dom: JSDOM;

  beforeEach(async () => {
    dom = new JSDOM('', { url: 'http://example.com/' });
    (global as any).window = dom.window;
    (global as any).history = dom.window.history;

    expect(history.replaceState).not.toBe(noop);
    expect(history.pushState).not.toBe(noop);

    TestBed.configureTestingModule({
      providers: [provideDisableHistoryWrites()]
    });

    // waiting for app initalizer to run
    await TestBed.inject(ApplicationInitStatus).donePromise;
  });

  afterEach(() => {
    dom.window.close();
    delete (global as any).window;
    delete (global as any).history;
  });

  it('should patch history.pushState()', () => {
    const { writable, configurable } = Object.getOwnPropertyDescriptor(history, 'pushState');

    expect(history.pushState).toBe(noop);
    expect(writable).toBe(false);
    expect(configurable).toBe(false);
  });

  it('should patch history.replaceState()', () => {
    const { writable, configurable } = Object.getOwnPropertyDescriptor(history, 'replaceState');

    expect(history.replaceState).toBe(noop);
    expect(writable).toBe(false);
    expect(configurable).toBe(false);
  });

  it('should not throw when calling patches', () => {
    expect(() => history.pushState({ data: 1 }, '', 'url')).not.toThrow();
    expect(() => history.replaceState({ data: 2 }, '', 'url')).not.toThrow();
  });

  it('should not allow re-patching', () => {
    expect(() =>
      Object.defineProperty(history, 'pushState', { value: () => {} })
    ).toThrow();
  });
});
