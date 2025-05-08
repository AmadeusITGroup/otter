/**
 * Model: PaymentStatus
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * An object describing the user's payment status.
 */
export interface PaymentStatus {
  /** The current payment status of the user on the resource, as a string enum:  - `UNPAID`: user has not paid for the resource - `PAID`: user has an active purchase on the resource - `TRIAL`: user is in the trial period for a subscription resource */
  type?: TypeEnum;
}

export type TypeEnum = 'UNPAID' | 'PAID' | 'TRIAL';

