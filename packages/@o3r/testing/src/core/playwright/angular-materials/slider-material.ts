import type { cssClasses } from '@material/slider';
import type { MatSliderProfile } from '../../angular-materials';
import { O3rElement, type PlaywrightSourceElement } from '../element';
import { O3rSliderElement } from '../elements';

const TRACK_CLASS: typeof cssClasses.TRACK = 'mdc-slider__track';
const THUMB_CLASS: typeof cssClasses.THUMB = 'mdc-slider__thumb';

/**
 * Implementation dedicated to Playwright.
 */
export class MatSlider extends O3rSliderElement implements MatSliderProfile {
  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    super(sourceElement, `.${TRACK_CLASS}`, `.${THUMB_CLASS}`);
  }
}
