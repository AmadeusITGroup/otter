import { TranspilationPurposeOnlyError } from '../../errors/index';

import { ElementProfile, O3rElement } from '../element';

/**
 * Interface to describe the Select elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface SelectElementProfile extends ElementProfile {
  /**
   * Select an element in a dropdown by index.
   */
  selectByIndex(index: number): Promise<void>;

  /**
   * Select an element in a dropdown by value.
   */
  selectByValue(value: string): Promise<void>;
}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rSelectElement extends O3rElement implements SelectElementProfile {
  constructor(_sourceElement: any) {
    super(_sourceElement);
  }

  /**
   * Select an element in a dropdown by index.
   *
   * @param _index
   */
  public selectByIndex(_index: number): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /**
   * Select an element in a dropdown by value.
   *
   * @param _value
   */
  public selectByValue(_value: string): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }
}
