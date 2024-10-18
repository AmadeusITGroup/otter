import {
  DebugElement
} from '@angular/core';
import {
  By
} from '@angular/platform-browser';
import type {
  SliderElementProfile
} from '../../elements';
import {
  O3rElement
} from '../element';

/**
 * Implementation dedicated to angular / TestBed.
 */
export class O3rSliderElement extends O3rElement implements SliderElementProfile {
  constructor(
    sourceElement: DebugElement,
    private readonly trackSelector?: string,
    private readonly thumbSelector?: string
  ) {
    super(sourceElement);
  }

  private getInputElement() {
    try {
      const subElement = this.sourceElement.query(By.css('input[type="range"]'));
      return subElement || this.sourceElement;
    } catch {
      return this.sourceElement;
    }
  }

  private getTrackElement() {
    if (!this.trackSelector) {
      return this.sourceElement;
    }
    try {
      const subElement = this.sourceElement.query(By.css(this.trackSelector));
      return subElement || this.sourceElement;
    } catch {
      return this.sourceElement;
    }
  }

  private getThumbElement() {
    if (!this.thumbSelector) {
      return this.sourceElement;
    }
    try {
      const subElement = this.sourceElement.query(By.css(this.thumbSelector));
      return subElement || this.sourceElement;
    } catch {
      return this.sourceElement;
    }
  }

  /**
   * @inheritdoc
   * inspired from https://github.com/angular/components/blob/main/src/material/slider/slider.spec.ts#L1838
   */
  public setValue(value: string): Promise<void> {
    const trackNativeElement = this.getTrackElement().nativeElement;
    const thumbNativeElement = this.getThumbElement().nativeElement;
    const inputNativeElement = this.getInputElement().nativeElement;
    const thumbBoundingBox: DOMRect = thumbNativeElement.getBoundingClientRect();
    const startX = thumbBoundingBox.x + thumbBoundingBox.width / 2;
    const startY = thumbBoundingBox.y + thumbBoundingBox.height / 2;
    const max = +(inputNativeElement.max === '' ? '100' : inputNativeElement.max);
    const min = +(inputNativeElement.min === '' ? '0' : inputNativeElement.min);
    const sanitizeValue = Math.max(min, Math.min(+value, max));
    const percent = (sanitizeValue - min) / (max - min);
    const { top, left, width, height } = trackNativeElement.getBoundingClientRect() as DOMRect;
    const endX = width * percent + left;
    const endY = top + height / 2;
    thumbNativeElement.dispatchEvent(new MouseEvent('mousedown', { clientX: startX, clientY: startY }));
    trackNativeElement.focus();
    trackNativeElement.dispatchEvent(new MouseEvent('mousemove', { clientX: endX, clientY: endY }));
    inputNativeElement.value = `${sanitizeValue}`;
    inputNativeElement.dispatchEvent(new Event('input'));
    trackNativeElement.dispatchEvent(new MouseEvent('mouseup', { clientX: endX, clientY: endY }));
    inputNativeElement.dispatchEvent(new Event('change'));
    return Promise.resolve();
  }

  /** @inheritdoc */
  public getValue() {
    return (new O3rElement(this.getInputElement())).getValue();
  }
}
