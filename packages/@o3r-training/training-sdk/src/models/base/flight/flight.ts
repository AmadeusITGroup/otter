/**
 * Model: Flight
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */

import {utils} from '@ama-sdk/core';


export interface Flight {
  originLocationCode?: string;
  destinationLocationCode?: string;
  /** @see utils.DateTime */
  departureDateTime?: utils.DateTime;
  /** @see Date */
  paymentExprirationDate?: Date;
}


