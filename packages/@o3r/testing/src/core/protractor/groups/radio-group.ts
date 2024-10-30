import {
  RadioGroupProfile
} from '../../groups/radio-group';
import {
  O3rRadioElement
} from '../elements/radio-element';
import {
  O3rGroup
} from '../group';

/**
 * Group element to manage a radio group
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class O3rRadioGroup extends O3rGroup<O3rRadioElement> implements RadioGroupProfile {
  constructor(sourceElement: O3rRadioElement[]) {
    super(sourceElement);
  }

  /** @inheritDoc */
  public async isValidGroup() {
    let name = '';

    for (const item of this.items) {
      const itemName = await item.getAttribute('name');
      if (name !== '' && name !== itemName) {
        // eslint-disable-next-line no-console -- no other logger available
        console.warn(`Items in this radio group are not consistent, incompatible input names found ${name} and ${itemName || 'undefined'}`);
        return false;
      }
      if (itemName !== undefined) {
        name = itemName;
      }
    }

    return true;
  }

  /**
   * Get the selected radio
   */
  public async getSelectedItem() {
    for (const item of this.items) {
      const isSelected = await item.isChecked();
      if (isSelected) {
        return item;
      }
    }

    return undefined;
  }
}
