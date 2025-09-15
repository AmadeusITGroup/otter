import { GetPayments200Response } from '../../models/base/get-payments200-response/index';

import { PaymentsApi, PaymentsApiGetPaymentsRequestData } from './payments-api';

export class PaymentsApiFixture implements Partial<Readonly<PaymentsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'PaymentsApi';

    /**
   * Fixture associated to function getPayments
   */
  public getPayments: jest.Mock<Promise<GetPayments200Response>, [PaymentsApiGetPaymentsRequestData]> = jest.fn();
}

