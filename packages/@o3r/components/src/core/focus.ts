import {EventEmitter} from '@angular/core';

/**
 * Custom wrapped input must implement this interface
 *
 * @deprecated will be removed in v10
 */
export interface ForwardFocus {
  /**
   * Emits event when the custom input is focused
   */
  focus: EventEmitter<FocusEvent>;

  /**
   * Emits event when the custom input is blured
   */
  blur: EventEmitter<FocusEvent>;
}
