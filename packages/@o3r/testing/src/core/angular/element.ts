import { DebugElement } from '@angular/core';
import { ElementProfile } from '../element';

export { ElementProfile } from '../element';

/**
 * Implementation dedicated to angular / TestBed.
 */
export class O3rElement implements ElementProfile {
  /** Angular element */
  public sourceElement: DebugElement;

  constructor(sourceElement: DebugElement | O3rElement) {
    this.sourceElement = sourceElement instanceof O3rElement ? sourceElement.sourceElement : sourceElement;
  }

  /**
   * Returns the text content of the DOM node.
   * Prioritizes .innerText, but fallbacks on .textContent in case the former is undefined in order
   * to support JSDOM.
   * @protected
   */
  protected get text(): string | undefined {
    const element = this.sourceElement.nativeElement;
    return element ? (element.innerText === undefined ? element.textContent : element.innerText) : undefined;
  }

  /** @inheritdoc */
  public getText() {
    return Promise.resolve(this.text);
  }

  /** @inheritdoc */
  public getPlainText() {
    const innerText = this.text;
    return Promise.resolve(innerText ? innerText.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/\s\s+/g, ' ').trim() : undefined);
  }

  /** @inheritdoc */
  public getInnerHTML(): Promise<string | undefined> {
    return Promise.resolve(this.sourceElement.nativeElement && (this.sourceElement.nativeElement.innerHTML as string));
  }

  /** @inheritdoc */
  public click() {
    this.sourceElement.nativeElement.click();
    return Promise.resolve();
  }

  /** @inheritdoc */
  public isVisible() {
    return Promise.resolve(this.sourceElement.nativeElement.style.display !== 'none' && this.sourceElement.nativeElement.style.visibility !== 'hidden');
  }

  /** @inheritdoc */
  public getAttribute(attributeName: string) {
    return Promise.resolve(this.sourceElement.nativeElement && (this.sourceElement.nativeElement.getAttribute(attributeName) as string));
  }

  /** @inheritdoc */
  public mouseOver() {
    this.sourceElement.nativeElement.mouseOver();
    this.sourceElement.nativeElement.dispatchEvent(new Event('mouseover'));
    return Promise.resolve();
  }

  /** @inheritdoc */
  public getValue() {
    return Promise.resolve(this.sourceElement.nativeElement && (this.sourceElement.nativeElement.value as string));
  }

  /** @inheritdoc */
  public setValue(input: string) {
    this.sourceElement.triggerEventHandler('focus', {target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {}});
    input.split('').forEach((key) => {
      this.sourceElement.triggerEventHandler('keydown', {target: this.sourceElement.nativeElement, key, preventDefault: () => {}, stopPropagation: () => {}});
      this.sourceElement.triggerEventHandler('keypress', {target: this.sourceElement.nativeElement, key, preventDefault: () => {}, stopPropagation: () => {}});
      this.sourceElement.triggerEventHandler('keyup', {target: this.sourceElement.nativeElement, key, preventDefault: () => {}, stopPropagation: () => {}});
    });
    this.sourceElement.nativeElement.value = input;
    this.sourceElement.triggerEventHandler('input', {target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {}});
    this.sourceElement.triggerEventHandler('blur', {target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {}});

    return Promise.resolve();
  }

  /** @inheritdoc */
  public clearValue() {
    this.sourceElement.triggerEventHandler('focus', {target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {}});
    this.sourceElement.nativeElement.value = '';
    this.sourceElement.triggerEventHandler('input', {target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {}});
    this.sourceElement.triggerEventHandler('blur', {target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {}});
    return Promise.resolve();
  }
}

/**
 * Constructor of a O3rElement
 */
export type O3rElementConstructor<T extends ElementProfile> = new (sourceElement: DebugElement | O3rElement) => T;
