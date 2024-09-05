import {ElementFinder} from 'protractor';
import {RadioElementProfile} from '../../elements';
import {O3rElement} from '../element';

/**
 * Implementation dedicated to karma / TestBed.
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class O3rRadioElement extends O3rElement implements RadioElementProfile {
  constructor(sourceElement: ElementFinder) {
    super(sourceElement);
  }

  /** @inheritDoc */
  public async check(value = true) {
    const currentValue = await this.isChecked();
    if (currentValue === value) {
      // eslint-disable-next-line no-console
      console.warn(`O3rRadioElement is already ${value ? 'checked' : 'unchecked'}`);
      return Promise.resolve();
    }

    return this.click();
  }

  /** @inheritDoc */
  public uncheck() {
    return this.check(false);
  }

  /** @inheritDoc */
  public async isChecked(): Promise<boolean> {
    const checked = await this.getAttribute('checked');
    return checked !== undefined;
  }
}
