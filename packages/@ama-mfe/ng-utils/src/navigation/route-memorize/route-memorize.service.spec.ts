import {
  TestBed,
} from '@angular/core/testing';
import {
  RouteMemorizeService,
} from './route-memorize.service';

describe('RouteMemorizeService', () => {
  let service: RouteMemorizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RouteMemorizeService] });
    service = TestBed.inject(RouteMemorizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should memorize a route', () => {
    service.memorizeRoute('channel1', 'url1');
    expect(service.getRoute('channel1')).toBe('url1');
  });

  it('should return undefined if no route is memorized for a given channelId', () => {
    expect(service.getRoute('channel2')).toBeUndefined();
  });

  it('should overwrite an existing route', () => {
    service.memorizeRoute('channel1', 'url1');
    service.memorizeRoute('channel1', 'url2');
    expect(service.getRoute('channel1')).toBe('url2');
  });

  // eslint-disable-next-line jest/no-done-callback -- use the callback function to finish the test
  it('should clear route after liveTime', (done) => {
    jest.useFakeTimers();
    service.memorizeRoute('channel1', 'url1', 1000);
    expect(service.getRoute('channel1')).toBe('url1');

    jest.advanceTimersByTime(1000);
    expect(service.getRoute('channel1')).toBeUndefined();
    done();
  });

  it('should clear previous timer if memorizeRoute is called again', () => {
    jest.useFakeTimers();
    service.memorizeRoute('channel1', 'url1', 1000);
    service.memorizeRoute('channel1', 'url2', 2000);

    jest.advanceTimersByTime(1000);
    expect(service.getRoute('channel1')).toBe('url2');

    jest.advanceTimersByTime(1000);
    expect(service.getRoute('channel1')).toBeUndefined();
  });
});
