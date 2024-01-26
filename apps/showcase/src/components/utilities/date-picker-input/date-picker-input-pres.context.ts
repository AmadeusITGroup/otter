import type {Context} from '@o3r/core';

/**
 * The ContextInput interface describes all the inputs of the component
 */
export interface DatePickerInputPresContextInput {
  /** ID of the html element used for selection */
  id: string;
}

/**
 * The ContextOutput interface describes all the outputs of the component
 */
export interface DatePickerInputPresContextOutput {}

/**
 * The context interface describes all the inputs and outputs of the component
 *
 *  It's the contract that the component has to follow and has three main uses:
 * - To type the context that is given to your ng-template when you want to replace a component from your app
 * - To have a common contract between multiple presenters of the same sort
 * - To extract the component medata in cms-adapters
 */
export interface DatePickerInputPresContext extends Context<DatePickerInputPresContextInput, DatePickerInputPresContextOutput> {}
