import type { SliderElementProfile } from '../../elements';
import { O3rElement, type PlaywrightSourceElement } from '../element';

/**
 * Implementation dedicated to Playwright.
 */
export class O3rSliderElement extends O3rElement implements SliderElementProfile {
  constructor(
    sourceElement: PlaywrightSourceElement | O3rElement,
    private readonly trackSelector?: string,
    private readonly thumbSelector?: string
  ) {
    super(sourceElement);
  }

  private async getInputElement() {
    try {
      const subElement = this.sourceElement.element.locator('input[type="range"]');
      if (await subElement.count()) {
        return subElement.first();
      }
      return this.sourceElement.element;
    } catch {
      return this.sourceElement.element;
    }
  }

  private async getTrackElement() {
    if (!this.trackSelector) {
      return this.sourceElement.element;
    }
    try {
      const subElement = this.sourceElement.element.locator(this.trackSelector);
      if (await subElement.count()) {
        return subElement.first();
      }
      return this.sourceElement.element;
    } catch {
      return this.sourceElement.element;
    }
  }

  private async getThumbElement() {
    if (!this.thumbSelector) {
      return this.sourceElement.element;
    }
    try {
      const subElement = this.sourceElement.element.locator(this.thumbSelector);
      if (await subElement.count()) {
        return subElement.first();
      }
      return this.sourceElement.element;
    } catch {
      return this.sourceElement.element;
    }
  }

  /** @inheritdoc */
  public async setValue(value: string): Promise<void> {
    const trackElement = await this.getTrackElement();
    const trackBoundingBox = await trackElement.boundingBox();
    const thumbElement = await this.getThumbElement();
    const inputElement = await this.getInputElement();
    const thumbBoundingBox = await thumbElement.boundingBox();
    if (!trackBoundingBox || !thumbBoundingBox) {
      return;
    }
    const startPosition = {
      x: thumbBoundingBox.x + thumbBoundingBox.width / 2,
      y: thumbBoundingBox.y + thumbBoundingBox.height / 2
    };
    await this.sourceElement.page.mouse.move(startPosition.x, startPosition.y);
    await this.sourceElement.page.mouse.down();

    const maxAttribute = await inputElement.getAttribute('max');
    const max = maxAttribute ? +maxAttribute : 100;
    const minAttribute = await inputElement.getAttribute('min');
    const min = minAttribute ? +minAttribute : 0;
    const percent = (Math.max(min, Math.min(+value, max)) - min) / (max - min);
    await this.sourceElement.page.mouse.move(
      trackBoundingBox.x + Math.round(trackBoundingBox.width * percent),
      trackBoundingBox.y + trackBoundingBox.height / 2
    );
    await this.sourceElement.page.mouse.up();
  }

  /** @inheritdoc */
  public async getValue() {
    return (new O3rElement({
      element: await this.getInputElement(),
      page: this.sourceElement.page
    })).getValue();
  }
}
