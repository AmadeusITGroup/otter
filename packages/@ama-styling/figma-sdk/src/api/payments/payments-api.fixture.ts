import { PaymentsApi } from './payments-api';

export class PaymentsApiFixture implements Partial<Readonly<PaymentsApi>> {

  /** @inheritDoc */
  public readonly apiName = 'PaymentsApi';

    /**
   * Fixture associated to function getPayments
   */
  public getPayments: jasmine.Spy = jasmine.createSpy('getPayments');
}
