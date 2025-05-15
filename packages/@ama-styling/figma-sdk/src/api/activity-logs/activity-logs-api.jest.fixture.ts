import { GetActivityLogs200Response } from '../../models/base/get-activity-logs200-response/index';

import { ActivityLogsApi, ActivityLogsApiGetActivityLogsRequestData } from './activity-logs-api';

export class ActivityLogsApiFixture implements Partial<Readonly<ActivityLogsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'ActivityLogsApi';

    /**
   * Fixture associated to function getActivityLogs
   */
  public getActivityLogs: jest.Mock<Promise<GetActivityLogs200Response>, [ActivityLogsApiGetActivityLogsRequestData]> = jest.fn();
}

