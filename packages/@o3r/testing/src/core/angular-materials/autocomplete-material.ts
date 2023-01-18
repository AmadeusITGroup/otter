import { TranspilationPurposeOnlyError } from '../../errors/index';

import { ElementProfile, O3rElement } from '../element';

/**
 * Interface to describe the material autocomplete elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface MatAutocompleteProfile extends ElementProfile {

  /**
   * Select an element in a dropdown by value.
   */
  selectByValue(value: string): Promise<void>;
}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class MatAutocomplete extends O3rElement implements MatAutocompleteProfile {
  constructor(_sourceElement: any) {
    super(_sourceElement);
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
