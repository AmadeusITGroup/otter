import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  Title,
} from '@angular/platform-browser';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import {
  Subject,
} from 'rxjs';
import {
  AnalyticsEventReporter,
} from '../tracker';
import {
  AnalyticsRouterTracker,
} from './analytics-router.service';

describe('Analytics router service', () => {
  let service: AnalyticsRouterTracker;
  let routerEvent: Subject<any>;
  let getTitle: () => string;
  let isTrackingActive: () => boolean;
  let reportEvent: jest.Mock;

  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  beforeEach(async () => {
    routerEvent = new Subject();
    getTitle = jest.fn().mockImplementation(() => 'test title');
    reportEvent = jest.fn();
    isTrackingActive = () => true;
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useFactory: () => {
            return { events: routerEvent };
          }
        },
        {
          provide: AnalyticsEventReporter,
          useFactory: () => {
            return { isTrackingActive, reportEvent };
          }
        },
        {
          provide: Title,
          useFactory: () => {
            return { getTitle };
          }
        }
      ]
    }).compileComponents();
    service = TestBed.inject(AnalyticsRouterTracker);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should ignore non-interesting events', () => {
    routerEvent.next(new NavigationStart(0, 'test'));
    expect(service).toBeDefined();
    expect(reportEvent).not.toHaveBeenCalled();
  });

  it('should emit correct event', () => {
    routerEvent.next(new NavigationEnd(0, 'test/url/start', 'test/url/final'));
    expect(service).toBeDefined();
    expect(reportEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'event',
      action: 'pageView'
    }));
  });

  it('should give final url as value', () => {
    routerEvent.next(new NavigationEnd(0, 'test/url/start', 'test/url/final'));
    expect(service).toBeDefined();
    expect(reportEvent).toHaveBeenCalledWith(expect.objectContaining({
      value: expect.objectContaining({
        title: 'test title',
        location: 'test/url/final'
      })
    }));
  });
});
