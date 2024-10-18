import { DebugElement } from '@angular/core';
import type { cssClasses } from '@material/slider';
import type { MatSliderProfile } from '../../angular-materials';
import { O3rElement } from '../element';
import { O3rSliderElement } from '../elements';

const TRACK_CLASS: typeof cssClasses.TRACK = 'mdc-slider__track';
const THUMB_CLASS: typeof cssClasses.THUMB = 'mdc-slider__thumb';

/**
 * Implementation dedicated to angular / TestBed.
 */
export class MatSlider extends O3rSliderElement implements MatSliderProfile {
  constructor(sourceElement: DebugElement | O3rElement) {
    super(
      sourceElement instanceof O3rElement ? sourceElement.sourceElement : sourceElement,
      `.${TRACK_CLASS}`,
      `.${THUMB_CLASS}`
    );
  }
}
