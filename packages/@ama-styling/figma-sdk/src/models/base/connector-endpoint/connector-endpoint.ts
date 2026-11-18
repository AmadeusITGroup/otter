/**
 * Model: ConnectorEndpoint
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ConnectorEndpointOneOf } from '../connector-endpoint-one-of';
import { ConnectorEndpointOneOf1 } from '../connector-endpoint-one-of1';

/**
 * Stores canvas location for a connector start/end point.
 */
export type ConnectorEndpoint = ConnectorEndpointOneOf | ConnectorEndpointOneOf1;

/** Array of MagnetEnum items */
export const LIST_MAGNET_ENUM = ['AUTO', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT', 'CENTER'] as const;

/** List of available values for MagnetEnum */
export type MagnetEnum = 'AUTO' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'CENTER';

