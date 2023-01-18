import { Observable } from 'rxjs';

/** Fact basic value type */
export type FactBasicValues = number | boolean | string | string[] | boolean[] | number [] | undefined;

/** Map of fact name / type pairs */
export interface FactDefinitions {
  [factName: string]: unknown;
}

/** Return type of a fact factory */
export type FactFactoryReturn<T> = Observable<T> | Promise<T> | T;

/** Set of facts */
export type FactSet<T extends FactDefinitions> = {
  [P in keyof T]: FactFactoryReturn<T[P] | undefined | null>;
};

/** Fact stream type */
export type FactValueStream<T = unknown> = Observable<T | undefined>;

/** Fact stream */
export interface Fact<T = unknown> {
  /** Fact ID */
  id: string;

  /** Stream of the fact fact value */
  value$: FactValueStream<T>;
}
