import type {Context} from '@o3r/core';
import type { DatePickerInputPresContextInput, DatePickerInputPresContextOutput } from '../date-picker-input/index';

/**
 * The ContextInput interface describes all the inputs of the component
 */
export interface DatePickerInputHebrewPresContextInput extends DatePickerInputPresContextInput {
}

/**
 * The ContextOutput interface describes all the outputs of the component
 */
export interface DatePickerInputHebrewPresContextOutput extends DatePickerInputPresContextOutput {}

/**
 * The context interface describes all the inputs and outputs of the component
 *
 *  It's the contract that the component has to follow and has three main uses:
 * - To type the context that is given to your ng-template when you want to replace a component from your app
 * - To have a common contract between multiple presenters of the same sort
 * - To extract the component medata in cms-adapters
 */
export interface DatePickerInputHebrewPresContext extends Context<DatePickerInputHebrewPresContextInput, DatePickerInputHebrewPresContextOutput> {}
