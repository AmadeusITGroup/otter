/**
 * Model: Order
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */

import {utils} from '@ama-sdk/core';


export interface Order {
  id?: number;
  petId?: number;
  quantity?: number;
  /** @see utils.DateTime */
  shipDate?: utils.DateTime;
  /** Order Status */
  status?: StatusEnum;
  complete?: boolean;
}

export type StatusEnum = 'placed' | 'approved' | 'delivered';

