/**
 * Model: Trigger
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { AfterTimeoutTrigger } from '../after-timeout-trigger';
import { OnKeyDownTrigger } from '../on-key-down-trigger';
import { OnMediaHitTrigger } from '../on-media-hit-trigger';
import { TriggerOneOf } from '../trigger-one-of';
import { TriggerOneOf1 } from '../trigger-one-of1';
import { TriggerOneOf2 } from '../trigger-one-of2';

/**
 * The `\"ON_HOVER\"` and `\"ON_PRESS\"` trigger types revert the navigation when the trigger is finished (the result is temporary). `\"MOUSE_ENTER\"`, `\"MOUSE_LEAVE\"`, `\"MOUSE_UP\"` and `\"MOUSE_DOWN\"` are permanent, one-way navigation. The `delay` parameter requires the trigger to be held for a certain duration of time before the action occurs. Both `timeout` and `delay` values are in milliseconds. The `\"ON_MEDIA_HIT\"` and `\"ON_MEDIA_END\"` trigger types can only trigger from a video. They fire when a video reaches a certain time or ends. The `timestamp` value is in seconds.
 */
export type Trigger = AfterTimeoutTrigger | OnKeyDownTrigger | OnMediaHitTrigger | TriggerOneOf | TriggerOneOf1 | TriggerOneOf2;

export type TypeEnum = 'ON_CLICK' | 'ON_HOVER' | 'ON_PRESS' | 'ON_DRAG' | 'AFTER_TIMEOUT' | 'MOUSE_ENTER' | 'MOUSE_LEAVE' | 'MOUSE_UP' | 'MOUSE_DOWN' | 'ON_KEY_DOWN' | 'ON_MEDIA_HIT' | 'ON_MEDIA_END';
export type DeviceEnum = 'KEYBOARD' | 'XBOX_ONE' | 'PS4' | 'SWITCH_PRO' | 'UNKNOWN_CONTROLLER';

