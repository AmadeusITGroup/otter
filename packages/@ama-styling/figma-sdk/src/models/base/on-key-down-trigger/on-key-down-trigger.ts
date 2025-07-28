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

export type TypeEnum = 'ON_KEY_DOWN';
export type DeviceEnum = 'KEYBOARD' | 'XBOX_ONE' | 'PS4' | 'SWITCH_PRO' | 'UNKNOWN_CONTROLLER';

