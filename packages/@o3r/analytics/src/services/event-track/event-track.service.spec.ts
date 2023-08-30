import type { Mark } from '@ama-sdk/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NavigationEnd, Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { skip, take } from 'rxjs/operators';
import { EVENT_TRACK_SERVICE_CONFIGURATION } from './event-track.configuration';
import { EventTrackService } from './event-track.service';

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
 * @param done
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
  let spyOnConstructorFirstLoad: jest.SpyInstance;

  beforeEach(async () => {
    spyOnConstructorFirstLoad = jest.spyOn(EventTrackService.prototype, 'markFirstLoad');
    await TestBed.configureTestingModule({
      providers: [
        EventTrackService,
        {provide: Router, useClass: MockRouter}
      ]
    }).compileComponents();
    service = TestBed.inject(EventTrackService);
    const promise = fireLoadEvent();
    await jest.runAllTimersAsync();
    return promise;
  });

  // TODO to be fixed with the redesign of the event-track service
  it.skip('should call different methods based on the NavigationEnd emissions', () => {
    const ret = new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(spyOnConstructorFirstLoad).toHaveBeenCalledTimes(1);
        resolve();
      }, 0);
    });
    return ret;
  });

  it('should get good values for the timing', async () => {
    const promise = service.getTiming();
    await jest.runAllTimersAsync();
    const timing = await promise;

    expect(timing.startTime).toBeLessThanOrEqual(timing.endTime);
  });

  it.skip('should call mark first load by default at first Navigation End', async () => {
    const firstData = await firstValueFrom(service.perfEventTrack$);

    expect(firstData.firstLoad).toBeDefined();
  });

  it.skip('should add a custom mark', async () => {
    await service.addCustomMark('testMark');
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(
      skip(1) // skip the first load marked by the navigation end
    ));

    expect(perfData.customMarks[0].label).toBe('testMark');
    expect(perfData.customMarks[0].timing.startTime).toBeLessThanOrEqual(perfData.customMarks[0].timing.endTime);
  });

  it('should start a custom mark event', async () => {
    service.startCustomMark('testMark');
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(skip(1)));
    expect(perfData.customMarks[0].label).toBe('testMark');
    expect(perfData.customMarks[0].timing.startTime).toBeDefined();
    expect(perfData.customMarks[0].timing.startTime).not.toBeNull();
    expect(perfData.customMarks[0].timing.endTime).not.toBeDefined();
  });

  it.skip('should end a custom mark event', async () => {
    await service.addCustomMark('testMarkInitial');
    const customEventIndex = service.startCustomMark('testMark');
    await new Promise((resolve) => setTimeout(resolve, 10));
    const customMarkEnded = service.endCustomMark(customEventIndex);
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(
      skip(3) // skip first load marked by the navigation end, skip add custom mark and skip start another custom mark
    ));

    expect(perfData.customMarks[0].label).toBe('testMarkInitial');
    expect(perfData.customMarks[1].label).toBe('testMark');
    expect(perfData.customMarks[1].timing.startTime).toBeLessThanOrEqual(perfData.customMarks[1].timing.endTime);
    expect(customMarkEnded).toBeTruthy();
  });

  it('end a custom mark event should do nothing if the event does not exist', async () => {
    service.startCustomMark('testMarkInitial');
    await jest.advanceTimersByTimeAsync(10);
    const customMarkEnded = service.endCustomMark(10);
    expect(customMarkEnded).toBeFalsy();
  });

  it.skip('should add the first paint value', async () => {
    await service.markFP(true);
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(
      skip(1) // skip the first load marked by the navigation end
    ));

    expect(perfData.perceived.FP.startTime).toBeLessThanOrEqual(perfData.perceived.FP.endTime);
  });

  it.skip('should add the first meaningful paint value', async () => {
    service.perfEventTrack$.pipe(take(1)).subscribe((firstData) => {
      expect(firstData.perceived.FMP).not.toBeDefined();
    });
    await service.markFMP();
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(
      skip(1) // skip the first load marked by the navigation end
    ));

    expect(perfData.perceived.FMP.startTime).toBeLessThanOrEqual(perfData.perceived.FMP.endTime);
  });

  it.skip('should add the data ready value', async () => {
    service.perfEventTrack$.pipe(take(1)).subscribe((firstData) => {
      expect(firstData.perceived.dataReady).not.toBeDefined();
    });
    await service.markDataReady();
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(
      skip(1) // skip the first load marked by the navigation end
    ));

    expect(perfData.perceived.dataReady.startTime).toBeLessThanOrEqual(perfData.perceived.dataReady.endTime);
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

describe('Performance metrics - service configuration browserApi', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: EventTrackService;
  const FP_BROWSER_TIME = 100;
  const browserFirstPaint = [
    {name: 'first-paint', entryType: 'paint', startTime: FP_BROWSER_TIME, duration: 0},
    {name: 'first-contentful-paint', entryType: 'paint', startTime: 125, duration: 0}
  ];

  beforeEach(() => {
    (window as any).performance.getEntriesByType = () => browserFirstPaint;
    TestBed.configureTestingModule({
      providers: [
        EventTrackService,
        {provide: Router, useClass: MockRouter},
        {provide: EVENT_TRACK_SERVICE_CONFIGURATION, useValue: {useBrowserApiForFirstFP: true}}
      ]
    });
    service = TestBed.inject(EventTrackService);
    return fireLoadEvent();
  });

  it.skip('should set the first paint from browser api', async () => {
    const perfData = await firstValueFrom(service.perfEventTrack$.pipe(
      skip(1) // skip initial state
    ));

    expect(perfData.perceived.FP.startTime).toBe(0);
    expect(perfData.perceived.FP.endTime).toBe(FP_BROWSER_TIME);
  });
});

describe('Performance metrics - service configuration activation', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let service: EventTrackService;
  let spyOnConstructor: jest.SpyInstance;

  beforeEach(() => {
    spyOnConstructor = jest.spyOn(EventTrackService.prototype, 'markFirstLoad').mockImplementation();
    TestBed.configureTestingModule({
      providers: [
        {provide: Router, useClass: MockRouter},
        {provide: EVENT_TRACK_SERVICE_CONFIGURATION, useValue: {activate: {perfTracking: false}}}
      ]
    });
    service = TestBed.inject(EventTrackService);
  });

  it('should do nothing when the tracking is not activated', () => {
    expect(spyOnConstructor).toHaveBeenCalledTimes(0);
  });

  it.skip('should activate performance tracking on runtime', async () => {
    expect(spyOnConstructor).toHaveBeenCalledTimes(0);
    service.togglePerfTracking(true);
    await service.markFMP();
    const firstData = await firstValueFrom(service.perfEventTrack$);

    expect(firstData.perceived.FMP).toBeDefined();
    expect(firstData.perceived.FP).not.toBeDefined();
  });
});
