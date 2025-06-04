/**
 * Model: TriggerOneOf1
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface TriggerOneOf1 {
  /** @see TypeEnum */
  type: TypeEnum;
  delay: number;
  /** Whether this is a [deprecated version](https://help.figma.com/hc/en-us/articles/360040035834-Prototype-triggers#h_01HHN04REHJNP168R26P1CMP0A) of the trigger that was left unchanged for backwards compatibility. If not present, the trigger is the latest version. */
  deprecatedVersion?: boolean;
}

export type TypeEnum = 'MOUSE_ENTER' | 'MOUSE_LEAVE' | 'MOUSE_UP' | 'MOUSE_DOWN';

