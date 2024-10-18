import {
  TranspilationPurposeOnlyError
} from '../../errors/index';
import {
  O3rRadioElement,
  RadioElementProfile
} from '../elements/radio-element';
import {
  GroupProfile,
  O3rGroup
} from '../group';

/**
 * Interface to describe the Radio Group that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface RadioGroupProfile extends GroupProfile<RadioElementProfile> {
  /** Get of selected items */
  getSelectedItem(): Promise<RadioElementProfile | undefined>;
}

/**
 * Mock for RadioGroupProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rRadioGroup extends O3rGroup<O3rRadioElement> implements RadioGroupProfile {
  constructor(sourceElement: O3rRadioElement[]) {
    super(sourceElement);
  }

  public getSelectedItem(): Promise<O3rRadioElement | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }
}
