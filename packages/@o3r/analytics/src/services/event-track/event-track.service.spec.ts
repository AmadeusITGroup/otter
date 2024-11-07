import type {
  Mark,
} from '@ama-sdk/core';
import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  firstValueFrom,
  Observable,
} from 'rxjs';
import {
  skip,
} from 'rxjs/operators';
import {
  EVENT_TRACK_SERVICE_CONFIGURATION,
} from './event-track.configuration';
import {
  EventTrackService,
} from './event-track.service';

class MockRouter {
  public p1 = new NavigationEnd(0, '/page1', '/page1');
  public p2 = new NavigationEnd(1, '/page2', '/page2');
  public events = new Observable((observer) => {
    observer.next(this.p1);
    setTimeout(() => {
      observer.next(this.p2);
      observer.complete();
    }, 100);
  });

  public url = '/test';
}

/**
 * Dispatch Event
 */
function fireLoadEvent() {
  return new Promise<void>((resolve) => setTimeout(() => {
    const evt = document.createEvent('Event');
    evt.initEvent('load', false, false);
    window.dispatchEvent(evt);
    resolve();
  }, 0));
}

describe('Performance metrics', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: EventTrackService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        EventTrackService,
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();
    service = TestBed.inject(EventTrackService);
    const promise = fireLoadEvent();
    await jest.runAllTimersAsync();
    return promise;
  });

  it('should get good values for the timing', async () => {
    const promise = service.getTiming();
    await jest.runAllTimersAsync();
    const timing = await promise;

    expect(timing.startTime).toBeLessThanOrEqual(timing.endTime);
  });

  it('should start a custom mark event', async () => {
    service.startCustomMark('testMark');
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(skip(1)));
    expect(perfData.customMarks[0].label).toBe('testMark');
    expect(perfData.customMarks[0].timing.startTime).toBeDefined();
    expect(perfData.customMarks[0].timing.startTime).not.toBeNull();
    expect(perfData.customMarks[0].timing.endTime).not.toBeDefined();
  });

  it('end a custom mark event should do nothing if the event does not exist', async () => {
    service.startCustomMark('testMarkInitial');
    await jest.advanceTimersByTimeAsync(10);
    const customMarkEnded = service.endCustomMark(10);
    expect(customMarkEnded).toBeFalsy();
  });

  it('should add a mark for a SDK server call', async () => {
    const sdkCallMark: Mark = {
      markId: '1',
      url: 'call/path',
      startTime: 100,
      endTime: 200,
      requestOptions: {}
    };
    await service.addSDKServerCallMark(sdkCallMark);
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(skip(1)));

    expect(perfData.serverCalls.length).toBe(1);
    expect(perfData.serverCalls[0].url).toBe('call/path');
    expect(perfData.serverCalls[0].requestId).toBeUndefined();
  });

  it('should add a mark for a SDK server call including response size and requestId', async () => {
    const headers: Headers = new Headers();
    headers.append('ama-request-id', 'UNIQUEID');
    const blob = new Blob(['foo', 'bar']);
    const sdkCallMark: Mark = {
      markId: '1',
      url: 'call/path',
      startTime: 100,
      endTime: 200,
      requestOptions: {},
      response: {
        clone: () => ({
          headers,
          blob: () => blob
        }) as any
      } as any
    };
    await service.addSDKServerCallMark(sdkCallMark);
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(skip(1)));

    expect(perfData.serverCalls.length).toBe(1);
    expect(perfData.serverCalls[0].url).toBe('call/path');
    expect(perfData.serverCalls[0].requestId).toBe('UNIQUEID');
    expect(perfData.serverCalls[0].responseSize).toBeDefined();
  });

  it('should reset the performance metrics of the page', async () => {
    service.resetPerfMarks();
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(skip(1)));
    expect(perfData.serverCalls.length).toBe(0);
    expect(perfData.perceived).toEqual({});
    expect(perfData.customMarks).toEqual([]);
  });
});

describe('Performance metrics - service configuration activation', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));
  let spyOnConstructor: jest.SpyInstance;

  beforeEach(() => {
    spyOnConstructor = jest.spyOn(EventTrackService.prototype, 'markFirstLoad').mockImplementation();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: EVENT_TRACK_SERVICE_CONFIGURATION, useValue: { activate: { perfTracking: false } } }
      ]
    });
  });

  it('should do nothing when the tracking is not activated', () => {
    expect(spyOnConstructor).toHaveBeenCalledTimes(0);
  });
});
