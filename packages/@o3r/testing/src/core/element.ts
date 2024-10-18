import {
  TranspilationPurposeOnlyError
} from '../errors/index';

/**
 * Interface to describe the ElementProfile that are queried inside a fixture.
 * As for ComponentFixture, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface ElementProfile {
  /**
   * Click on the element. Simple click with left button.
   */
  click(): Promise<void>;

  /**
   * Returns a promise that resolves with the value of the attribute given in parameter.
   */
  getAttribute(attributeName: string): Promise<string | undefined>;

  /**
   * Returns a promise that resolves with the text of the element or undefined.
   */
  getText(): Promise<string | undefined>;

  /**
   * Get the text of an element, remove the multiple whitespaces and linebreaks
   * Returns a promise that resolves with the formatted text or undefined.
   */
  getPlainText(): Promise<string | undefined>;

  /**
   * Returns a promise that resolves with the inner html of the element or undefined.
   */
  getInnerHTML(): Promise<string | undefined>;

  /**
   * Put the cusrsor on the element.
   */
  mouseOver(): Promise<void>;

  /**
   * Returns a promise that resolves with the current value of an input or undefined.
   */
  getValue(): Promise<string | undefined>;

  /**
   * Set the value in an input.
   */
  setValue(input: string): Promise<void>;

  /**
   * Clears the value in the input
   */
  clearValue(): Promise<void>;

  /**
   * Check if an element is visible ( display !none and visibility !hidden)
   */
  isVisible(): Promise<boolean>;
}

/**
 * Constructor of a O3rElement
 */
export type O3rElementConstructor<T extends ElementProfile> = new (sourceElement: any) => T;

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class O3rElement implements ElementProfile {
  constructor(_sourceElement: any) {}

  public getInnerHTML(): Promise<string | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public getText(): Promise<string | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public getPlainText(): Promise<string | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public click(): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public getAttribute(_attributeName: string): Promise<string | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public mouseOver(): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public getValue(): Promise<string | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public setValue(_input: string): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public clearValue(): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public isVisible(): Promise<boolean> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }
}
