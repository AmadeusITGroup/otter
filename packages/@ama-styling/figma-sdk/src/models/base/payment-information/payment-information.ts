/**
 * Model: PaymentInformation
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { PaymentStatus } from '../payment-status';

/**
 * An object describing a user's payment information for a plugin, widget, or Community file.
 */
export interface PaymentInformation {
  /** The ID of the user whose payment information was queried. Can be used to verify the validity of a response. */
  user_id: string;
  /** The ID of the plugin, widget, or Community file that was queried. Can be used to verify the validity of a response. */
  resource_id: string;
  /** The type of the resource. */
  resource_type: ResourceTypeEnum;
  /** @see PaymentStatus */
  payment_status: PaymentStatus;
  /** The UTC ISO 8601 timestamp indicating when the user purchased the resource. No value is given if the user has never purchased the resource.  Note that a value will still be returned if the user had purchased the resource, but no longer has active access to it (e.g. purchase refunded, subscription ended). */
  date_of_purchase?: string;
}

export type ResourceTypeEnum = 'PLUGIN' | 'WIDGET' | 'COMMUNITY_FILE';

