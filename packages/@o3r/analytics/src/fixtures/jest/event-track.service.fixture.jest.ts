import type {
  EventTrackService,
} from '@o3r/analytics';

/**
 * Fixture for the EventTrack Service
 */
export class EventTrackServiceFixture implements Readonly<Partial<EventTrackService>> {
  /** @inheritdoc */
  public markFirstLoad: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public markFP: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public markFMP: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public markDataReady: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public addCustomMark: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public addServerCallMark: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public addSDKServerCallMark: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public startCustomMark: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public endCustomMark: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public getTiming: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public addEvent: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public addUiEvent: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public toggleTracking: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public toggleUiTracking: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public togglePerfTracking: jest.Mock<any, any> = jest.fn();

  /** @inheritdoc */
  public addCustomEvent: jest.Mock<any, any> = jest.fn();
}
