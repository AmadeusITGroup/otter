import {
  RadioElementProfile
} from '../../elements';
import {
  O3rElement,
  PlaywrightSourceElement
} from '../element';

/**
 * Implementation dedicated to Playwright.
 */
export class O3rRadioElement extends O3rElement implements RadioElementProfile {
  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritDoc */
  public async check(value = true) {
    if ((await this.isChecked()) === value) {
      console.warn(`O3rRadioELement is already ${value ? 'checked' : 'unchecked'}`);
      return;
    }
    return this.sourceElement.element.setChecked(value);
  }

  /** @inheritDoc */
  public async uncheck() {
    return this.check(false);
  }

  /** @inheritDoc */
  public isChecked(): Promise<boolean> {
    return this.sourceElement.element.isChecked();
  }
}
