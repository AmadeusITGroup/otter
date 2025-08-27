/**
 * Model: GetPayments200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PaymentInformation } from '../payment-information';

export interface GetPayments200Response {
  /** The response status code. */
  status: StatusEnum;
  /** For successful requests, this value is always `false`. */
  error: boolean;
  /** @see PaymentInformation */
  meta: PaymentInformation;
}

export type StatusEnum = '200';

