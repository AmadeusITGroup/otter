import { TranspilationPurposeOnlyError } from '../errors/index';
import { ElementProfile, O3rElement } from './element';

/**
 * Constructor of a O3rGroup
 */
// eslint-disable-next-line no-use-before-define
export type O3rGroupConstructor<T extends GroupProfile<V>, V extends ElementProfile> = new (sourceElement: V[]) => T;

/**
 * Interface to describe the GroupProfile that are queried inside a fixture.
 * As for ComponentFixture, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface GroupProfile<T extends ElementProfile> {
  /** List of items */
  items: T[];

  /** Check if the group is valid */
  isValidGroup(): Promise<boolean>;
}

/**
 * Mock for GroupProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rGroup<T extends O3rElement> implements GroupProfile<T> {

  /** @inheritDoc */
  public get items(): T[] {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  constructor(_sourceElement: T[]) {}

  /** @inheritDoc */
  public isValidGroup(): Promise<boolean> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }
}
