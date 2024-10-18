import {
  GroupProfile
} from '../group';
import {
  ElementProfile,
  O3rElement
} from './element';

export { GroupProfile } from '../group';

/**
 * Constructor of a O3rGroup
 */
// eslint-disable-next-line no-use-before-define
export type O3rGroupConstructor<T extends GroupProfile<V>, V extends ElementProfile> = new (sourceElement: V[]) => T;

/**
 * Implementation dedicated to angular / TestBed.
 */
export class O3rGroup<T extends O3rElement> implements GroupProfile<T> {
  /** @inheritDoc */
  public get items(): T[] {
    return this.sourceElement;
  }

  constructor(protected sourceElement: T[]) {}

  /** @inheritDoc */
  public isValidGroup() {
    return Promise.resolve(true);
  }
}
