import { TranspilationPurposeOnlyError } from '../../errors/index';
import { O3rElement } from '../element';
import { SelectElementProfile } from '../elements';

/**
 * Interface to describe the material select elements that are used inside a fixture.
 * As for ComponentFixtureProfile, this abstracts the testing framework that is used by choosing the right
 * implementation at runtime.
 */
export interface MatSelectProfile extends SelectElementProfile {}

/**
 * Mock for ElementProfile class.
 * This class is used for fixture compilation purpose.
 */
export class MatSelect extends O3rElement implements MatSelectProfile {
  constructor(_sourceElement: any) {
    super(_sourceElement);
  }

  /**
   * Select an element in a dropdown by index.
   *
   * @param _index
   */
  public selectByIndex(_index: number): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /**
   * Select an element in a dropdown by value.
   *
   * @param _value
   * @param _timeout
   * @deprecated selectByValue relies on ng-reflect-value, which doesn't work when app is in production mode
   */
  public selectByValue(_value: string, _timeout?: number): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /**
   * Select an element in a dropdown by label.
   *
   * @param _label
   * @param _timeout
   */
  public selectByLabel(_label: string, _timeout?: number): Promise<void> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /**
   * @deprecated Usage of "getValue" is not recommended on Material Select elements. Use "getPlainText()" instead.
   */
  public getValue() {
    return super.getValue();
  }
}
