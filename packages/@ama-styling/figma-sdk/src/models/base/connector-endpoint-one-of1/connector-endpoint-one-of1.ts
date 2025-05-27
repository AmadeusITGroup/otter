/**
 * Model: ConnectorEndpointOneOf1
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface ConnectorEndpointOneOf1 {
  /** Node ID that this endpoint attaches to. */
  endpointNodeId?: string;
  /** The magnet type is a string enum. */
  magnet?: MagnetEnum;
}

export type MagnetEnum = 'AUTO' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'CENTER';

