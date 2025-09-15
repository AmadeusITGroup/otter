import { ActivityLogsApi } from './activity-logs-api';

export class ActivityLogsApiFixture implements Partial<Readonly<ActivityLogsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ActivityLogsApi';

    /**
   * Fixture associated to function getActivityLogs
   */
  public getActivityLogs: jasmine.Spy = jasmine.createSpy('getActivityLogs');
}
