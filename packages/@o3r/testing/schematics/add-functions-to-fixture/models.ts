/**
 * Type of method available for default fixture
 */
export type MethodType =
  | 'clickOnButton'
  | 'getText'
  | 'getInputValue'
  | 'setInputValue'
  | 'getTextInList'
  | 'clickButtonInList'
  | 'getNumberOfItems';

/**
 * Return type associated to the MethodType
 */
export const returnType = {
  clickOnButton: 'Promise<void>',
  getText: 'Promise<string | undefined>',
  getInputValue: 'Promise<string | undefined>',
  setInputValue: 'Promise<void>',
  getTextInList: 'Promise<string | undefined>',
  clickButtonInList: 'Promise<void>',
  getNumberOfItems: 'Promise<number>'
} as const satisfies Record<MethodType, string>;

/**
 * Description associated to the MethodType
 */
export const description = {
  clickOnButton: `
  /**
   * Click on the button
   */`,
  getText: `
  /**
   * Get the text
   *
   * @returns text
   */`,
  getInputValue: `
  /**
   * Get the input value
   *
   * @returns input value
   */`,
  setInputValue: `
  /**
   * Set value into the input
   *
   * @param value
   */`,
  getTextInList: `
  /**
   * Get the text at the index of the list
   *
   * @param index
   * @returns text
   */`,
  clickButtonInList: `
  /**
   * Click on the button at the index of the list
   *
   * @param index
   */`,
  getNumberOfItems: `
  /**
   * Get the number of items
   *
   * @returns number of items
   */`
} as const satisfies Record<MethodType, string>;
