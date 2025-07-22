import {
  ElementProfile,
  O3rElement,
} from '../element';

/**
 * Interface to describe the Slider elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface SliderElementProfile extends ElementProfile {}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rSliderElement extends O3rElement implements SliderElementProfile {
  constructor(sourceElement: any, _trackSelector?: string, _thumbSelector?: string) {
    super(sourceElement);
  }
}
