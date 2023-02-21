import { TranspilationPurposeOnlyError } from '../../errors/index';

import { O3rElement } from '../element';
import { CheckboxElementProfile } from './checkbox-element';

/**
 * Interface to describe the Checkbox elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 *
 * Note: This fixture is provided only to handle an edge case where you have a link in the middle of the checkbox's label
 */
export interface ProgrammaticCheckboxElementProfile extends CheckboxElementProfile {}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rProgrammaticCheckboxElement extends O3rElement implements ProgrammaticCheckboxElementProfile {
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
