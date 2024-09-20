import {ElementFinder} from 'protractor';
import {CheckboxElementProfile} from '../../elements';
import {O3rElement} from '../element';

/**
 * Implementation dedicated to karma / TestBed.
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class O3rCheckboxElement extends O3rElement implements CheckboxElementProfile {
  constructor(sourceElement: ElementFinder) {
    super(sourceElement);
  }

  /** @inheritDoc */
  public async check(value = true, associatedLabel?: O3rElement) {
    const currentValue = await this.isChecked();
    if (currentValue === value) {
      return Promise.resolve();
    }

    return associatedLabel ? associatedLabel.click() : this.click();
  }

  /** @inheritDoc */
  public uncheck() {
    return this.check(false);
  }

  /** @inheritDoc */
  public async isChecked(): Promise<boolean> {
    const value = await this.sourceElement.isSelected();
    return value;
  }
}
