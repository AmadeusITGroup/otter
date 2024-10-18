import {
  firstValueFrom
} from 'rxjs';
import {
  AbTestBridge,
  AbTestBridgeInterface
} from './ab-testing-bridge';

describe('A/B testing bridge', () => {
  it('should add a new bridge to the window', () => {
    const bridgeName = 'ab-test';
    const readyEventName = 'ab-test-ready';
    expect((window as any)[bridgeName]).toBe(undefined);
    const spy = jest.spyOn(document, 'dispatchEvent');
    new AbTestBridge<string>((a?: string, b?: string) => a === b, { bridgeName, readyEventName });
    expect(spy.mock.calls[0][0] instanceof CustomEvent).toBe(true);
    expect(spy.mock.calls[0][0].type).toBe(readyEventName);
    expect((window as any)[bridgeName]).not.toBe(undefined);
    expect((window as any)[bridgeName].start).not.toBe(undefined);
    expect((window as any)[bridgeName].stop).not.toBe(undefined);
  });
  it('should share the A/B testing experiments via the bridge experiments$', async () => {
    const bridgeName = 'ab-test-2';
    const readyEventName = 'ab-test-ready-2';
    const bridge = new AbTestBridge<string>((a?: string, b?: string) => a === b, { bridgeName, readyEventName });
    const windowBridge: AbTestBridgeInterface<string> = (window as any)[bridgeName];

    windowBridge.start('first-experiment');
    expect(await firstValueFrom(bridge.experiments$)).toEqual(['first-experiment']);
    windowBridge.start('second-experiment');
    windowBridge.stop('first-experiment');
    expect(await firstValueFrom(bridge.experiments$)).toEqual(['second-experiment']);
  });

  it('should support a list of experiment', async () => {
    const bridgeName = 'ab-test-3';
    const readyEventName = 'ab-test-ready-3';
    const bridge = new AbTestBridge<string>((a?: string, b?: string) => a === b, { bridgeName, readyEventName });
    const windowBridge: AbTestBridgeInterface<string> = (window as any)[bridgeName];

    windowBridge.start(['first-experiment', 'second-experiment', 'third-experiment', 'fourth-experiment']);
    expect(await firstValueFrom(bridge.experiments$))
      .toEqual(['first-experiment', 'second-experiment', 'third-experiment', 'fourth-experiment']);
    windowBridge.stop(['second-experiment', 'third-experiment']);
    expect(await firstValueFrom(bridge.experiments$))
      .toEqual(['first-experiment', 'fourth-experiment']);
    windowBridge.stop();
    expect(await firstValueFrom(bridge.experiments$))
      .toEqual([]);
  });
});
