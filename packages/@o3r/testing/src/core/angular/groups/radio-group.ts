import { RadioGroupProfile } from '../../groups/radio-group';
import { O3rRadioElement } from '../elements/radio-element';
import { O3rGroup } from '../group';

/**
 * Group element to manage a radio group
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
        return false;
      }

      name = itemName;
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
