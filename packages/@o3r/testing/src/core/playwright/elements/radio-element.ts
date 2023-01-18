import {RadioElementProfile} from '../../elements';
import {O3rElement, PlaywrightSourceElement} from '../element';

/**
 * Implementation dedicated to Playwright.
 */
export class O3rRadioElement extends O3rElement implements RadioElementProfile {
  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritDoc */
  public check(value = true) {
    return this.sourceElement.element.setChecked(value);
  }

  /** @inheritDoc */
  public uncheck() {
    return this.check(false);
  }

  /** @inheritDoc */
  public isChecked(): Promise<boolean> {
    return this.sourceElement.element.isChecked();
  }
}
