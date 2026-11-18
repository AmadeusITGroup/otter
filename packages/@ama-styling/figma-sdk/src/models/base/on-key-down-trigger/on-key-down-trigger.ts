/**
 * Model: OnKeyDownTrigger
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface OnKeyDownTrigger {
  /** @see TypeEnum */
  type: TypeEnum;
  /** @see DeviceEnum */
  device: DeviceEnum;
  /** List of numbers */
  keyCodes: number[];
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['ON_KEY_DOWN'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'ON_KEY_DOWN';
/** Array of DeviceEnum items */
export const LIST_DEVICE_ENUM = ['KEYBOARD', 'XBOX_ONE', 'PS4', 'SWITCH_PRO', 'UNKNOWN_CONTROLLER'] as const;

/** List of available values for DeviceEnum */
export type DeviceEnum = 'KEYBOARD' | 'XBOX_ONE' | 'PS4' | 'SWITCH_PRO' | 'UNKNOWN_CONTROLLER';

