/**
 * Model: Order
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface Order {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  /** Order Status */
  status?: StatusEnum;
  complete?: boolean;
}

export type StatusEnum = 'placed' | 'approved' | 'delivered';

