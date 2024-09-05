export * from '@ngrx/store';

import { select as baseSelect } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { FakeSelectCall, isSelectorSpyCall, SelectorFunction, SelectorSpy } from './typings';


/** Global variable that holds the registered spies */
let registeredSpies: SelectorSpy<any>[] = [];

/**
 *
 *  PRIVATE METHODS
 *
 */

/**
 * Searches for the index of given selector
 * @param selectFn Selector function to be searched
 */
const getSpyIndex = <S extends object>(selectFn: SelectorFunction<S, any>) => registeredSpies.findIndex((spy) => spy.selector === selectFn);
/**
 * Searches for the given selector spy. Returns undefined if none is registered
 * @param selectFn Selector function to be searched
 */
const getSpy = (selectFn: SelectorFunction<object, any>) => {
  const index = getSpyIndex(selectFn);
  return index >= 0 ? registeredSpies[index] : undefined;
};
/**
 * Uses the spy as the return of a select
 * @param spy The selector spy
 */
function useSpy<R>(spy: SelectorSpy<R>): (source$: Observable<any>) => Observable<R> {
  return isSelectorSpyCall(spy) ? spy.fakeResult : () => of(spy.fakeResult);
}

/**
 *
 *  PUBLIC METHODS
 *
 */

/**
 * Clears all the registered selector spies
 */
export function clearSelectorSpies() {
  registeredSpies = [];
}

/**
 * Initialize the selector spies structure
 */
export function initializeSelectorSpies() {
  clearSelectorSpies();
}

/**
 * Spy on a selector function
 * @param selector Selector function to be spied on
 * @param fakeResult The fake result to be used when a select is triggered
 */
export function spyOnSelector<R, S extends object = object>(selector: SelectorFunction<S, R>, fakeResult: R | FakeSelectCall<R>) {
  const spyIndex = getSpyIndex(selector);
  if (spyIndex >= 0) {
    registeredSpies[spyIndex].fakeResult = fakeResult;
  } else {
    registeredSpies.push({ selector: selector as SelectorFunction<object, R>, fakeResult });
  }
}

/**
 * Removes the spy on a given selector function
 * @param selector Selector function that is being spied on
 */
export function clearSelectorSpy<R, S extends object = object>(selector: SelectorFunction<S, R>) {
  const spyIndex = getSpyIndex(selector);
  if (spyIndex >= 0) {
    registeredSpies.splice(spyIndex, 1);
  }
}

/**
 * Highjacked ngrx/store select. It checks if the selector function is being spied on
 * and returns it's fake result. Otherwise, it runs the original ngrx/store select
 * @param selectFn Selector function to be used
 * @param props optional properties to be used by the selector
 */
export function select(selectFn: SelectorFunction<object, any>, props?: object) {
  const spy = getSpy(selectFn);
  return spy ? useSpy(spy) : baseSelect(selectFn, props);
}
