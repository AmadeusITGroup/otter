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

/** Array of StatusEnum items */
export const LIST_STATUS_ENUM = ['placed', 'approved', 'delivered'] as const;

/** List of available values for StatusEnum */
export type StatusEnum = 'placed' | 'approved' | 'delivered';

