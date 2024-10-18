import {
  TranspilationPurposeOnlyError
} from '../../errors/index';
import {
  ElementProfile,
  O3rElement
} from '../element';

/**
 * Interface to describe the Radio elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface RadioElementProfile extends ElementProfile {
  /**
   * Check the radio element
   * @param  value If specified, determine the value of the radio button
   */
  check(value?: boolean): Promise<void>;

  /**
   * Uncheck the radio element
   */
  uncheck(): Promise<void>;

  /**
   * Return true if the radio button is checked
   */
  isChecked(): Promise<boolean>;
}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rRadioElement extends O3rElement implements RadioElementProfile {
  constructor(_sourceElement: any) {
    super(_sourceElement);
  }

  /** @inheritDoc */
  public check(_value = true): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritDoc */
  public uncheck(): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritDoc */
  public isChecked(): Promise<boolean> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }
}
