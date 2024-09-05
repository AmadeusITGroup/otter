import { Observable } from 'rxjs';

/** Specifies a fake select call */
export type FakeSelectCall<R> = ($source: Observable<any>) => Observable<R>;

/**
 * Type representing a state selector function
 */
export type SelectorFunction<S, R> = (state: S, props?: object) => R;

/**
 * Base selector spy
 */
export interface BaseSelectorSpy<R, S extends object = object> {
  /** The selector to be spied on */
  selector: SelectorFunction<S, R>;
}

/**
 * Represents a spy for a given Memoized selector
 * that returns a fake value
 */
export interface SelectorSpyResult<R, S extends object = object> extends BaseSelectorSpy<R, S> {
  /** The fake result to be returned */
  fakeResult: R;
}

/**
 * Represents a spy for a given Memoized selector
 * that returns a fake call
 */
export interface SelectorSpyCall<R, S extends object = object> extends BaseSelectorSpy<R, S> {
  /** The fake result call to be used */
  fakeResult: FakeSelectCall<R>;
}

/**
 * Represents a spy for a given Memoized selector
 */
export type SelectorSpy<R, S extends object = object> = SelectorSpyResult<R, S> | SelectorSpyCall<R, S>;

/**
 * Identifies if spy is a spyResult or spyCall
 * @param spy
 */
export function isSelectorSpyCall<R>(spy: SelectorSpy<R>): spy is SelectorSpyCall<R> {
  return typeof spy.fakeResult === 'function';
}
