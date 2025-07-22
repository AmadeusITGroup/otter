import type {
  EventTrackService,
} from '@o3r/analytics';

/**
 * Fixture for the EventTrack Service
 */
export class EventTrackServiceFixture implements Readonly<Partial<EventTrackService>> {
  /** @inheritdoc */
  public markFirstLoad: jasmine.Spy = jasmine.createSpy('markFirstLoad');

  /** @inheritdoc */
  public markFP: jasmine.Spy = jasmine.createSpy('markFP');

  /** @inheritdoc */
  public markFMP: jasmine.Spy = jasmine.createSpy('markFMP');

  /** @inheritdoc */
  public markDataReady: jasmine.Spy = jasmine.createSpy('markDataReady');

  /** @inheritdoc */
  public addCustomMark: jasmine.Spy = jasmine.createSpy('addCustomMark');

  /** @inheritdoc */
  public addServerCallMark: jasmine.Spy = jasmine.createSpy('addServerCallMark');

  /** @inheritdoc */
  public addSDKServerCallMark: jasmine.Spy = jasmine.createSpy('addSDKServerCallMark');

  /** @inheritdoc */
  public startCustomMark: jasmine.Spy = jasmine.createSpy('startCustomMark');

  /** @inheritdoc */
  public endCustomMark: jasmine.Spy = jasmine.createSpy('endCustomMark');

  /** @inheritdoc */
  public getTiming: jasmine.Spy = jasmine.createSpy('getTiming');

  /** @inheritdoc */
  public addEvent: jasmine.Spy = jasmine.createSpy('addEvent');

  /** @inheritdoc */
  public addUiEvent: jasmine.Spy = jasmine.createSpy('addUiEvent');

  /** @inheritdoc */
  public toggleTracking: jasmine.Spy = jasmine.createSpy('toggleTracking');

  /** @inheritdoc */
  public toggleUiTracking: jasmine.Spy = jasmine.createSpy('toggleUiTracking');

  /** @inheritdoc */
  public togglePerfTracking: jasmine.Spy = jasmine.createSpy('togglePerfTracking');

  /** @inheritdoc */
  public addCustomEvent: jasmine.Spy = jasmine.createSpy('addCustomEvent');
}
