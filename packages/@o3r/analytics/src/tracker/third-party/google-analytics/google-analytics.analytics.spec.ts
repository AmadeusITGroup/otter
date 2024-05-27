import type {
  AnalyticsThirdPartyService,
} from '../analytics-third-party.interfaces';
import {
  createGoogleAnalyticsService,
} from './google-analytics.analytics';

const uuid = 'my-ID';

describe('Google Analytics handler', () => {
  let gaService!: AnalyticsThirdPartyService;

  beforeEach(() => gaService = createGoogleAnalyticsService({ uuid }));

  it('should get instantiated', () => {
    expect(gaService).toBeDefined();
    expect(gaService).toEqual(expect.objectContaining({
      onRegistration: expect.any(Function),
      emit: expect.any(Function)
    }));
  });

  it('should register data-layer and initialize config', async () => {
    const arr: any[] = [];
    window.dataLayer = arr;

    await gaService.onRegistration();
    expect(arr).toContainEqual(['js', expect.any(Date)]);
    expect(arr).toContainEqual(['config', uuid]);
  });

  it('should handle known action', async () => {
    const arr: any[] = [];
    window.dataLayer = arr;

    await gaService.onRegistration();
    await gaService.emit({
      reportedAt: 0,
      report: {
        type: 'event',
        action: 'pageView',
        location: 'test-location',
        title: 'test-title'
      }
    });

    expect(arr).toContainEqual(['event', 'page_view', {

      page_location: 'test-location',

      page_title: 'test-title'
    }]);
  });

  it('should handle custom actions', async () => {
    const arr: any[] = [];
    window.dataLayer = arr;

    await gaService.onRegistration();
    await gaService.emit({
      reportedAt: 0,
      report: {
        type: 'event',
        action: '_myAction',
        value: { test: true }
      }
    });

    expect(arr).toContainEqual(['event', 'myAction', { test: true }]);
  });

  it('should warn non-handle events', async () => {
    const arr: any[] = [];
    const logger: any = {
      warn: jest.fn()
    };
    window.dataLayer = arr;

    await gaService.onRegistration();
    await gaService.emit({
      reportedAt: 0,
      report: {
        type: 'event',
        action: 'myAction',
        value: { test: true }
      } as any
    }, { logger });

    expect(arr).not.toContainEqual(['event', 'myAction', { test: true }]);
    expect(logger.warn).toHaveBeenCalled();
  });
});
