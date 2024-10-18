import {
  TranspilationPurposeOnlyError
} from '../../errors/index';
import {
  ElementProfile,
  O3rElement
} from '../element';

/**
 * Interface to describe the Checkbox elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface CheckboxElementProfile extends ElementProfile {
  /**
   * Check the checkbox element
   * @param  value If specified, determine the value of the checkbox button
   * @param  associatedLabel If specified, specify the label associated to the checkbox
   */
  check(value?: boolean, associatedLabel?: O3rElement): Promise<void>;

  /**
   * Uncheck the checkbox element
   */
  uncheck(): Promise<void>;

  /**
   * Return true if the checkbox button is checked
   */
  isChecked(): Promise<boolean>;
}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rCheckboxElement extends O3rElement implements CheckboxElementProfile {
  constructor(_sourceElement: any) {
    super(_sourceElement);
  }

  /** @inheritDoc */
  public check(_value = true, _associatedLabel?: O3rElement): Promise<void> {
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
