import {
  O3rElement
} from '../element';
import type {
  SliderElementProfile
} from '../elements';

/**
 * Interface to describe the material Slider elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface MatSliderProfile extends SliderElementProfile {}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class MatSlider extends O3rElement implements MatSliderProfile {
  constructor(sourceElement: any) {
    super(sourceElement);
  }
}
