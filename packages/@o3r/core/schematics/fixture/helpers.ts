import { MethodType, returnType } from './models';

const getMethodName = (selector: string, method: MethodType) => {
  // PascalCase converter
  const formattedSelectedText = selector
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      (_$1: string, $2: string, $3: string) => $2.toUpperCase() + $3
    )
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
  switch (method) {
    case 'clickOnButton': {
      return `clickOn${formattedSelectedText}Button`;
    }
    case 'getText': {
      return `get${formattedSelectedText}Text`;
    }
    case 'getInputValue': {
      return `get${formattedSelectedText}Value`;
    }
    case 'setInputValue': {
      return `set${formattedSelectedText}Value`;
    }
    case 'getTextInList': {
      return `get${formattedSelectedText}TextAtIndex`;
    }
    case 'clickButtonInList': {
      return `clickOn${formattedSelectedText}ButtonAtIndex`;
    }
    case 'getNumberOfItems': {
      return `getNumberOf${formattedSelectedText}`;
    }
    default: {
      return 'notHandle';
    }
  }
};

/**
 * Get the signature of the function
 *
 * @param methodType the type of the method
 * @param selector query selector
 * @returns the signature of the function
 */
export const getSignature = (
  methodType: MethodType,
  selector: string
) => {
  const methodName = getMethodName(selector, methodType);
  switch (methodType) {
    case 'clickOnButton': {
      return `${methodName}(): ${returnType[methodType]}`;
    }
    case 'getText': {
      return `${methodName}(): ${returnType[methodType]}`;
    }
    case 'getInputValue': {
      return `${methodName}(): ${returnType[methodType]}`;
    }
    case 'setInputValue': {
      return `${methodName}(value: string): ${returnType[methodType]}`;
    }
    case 'getTextInList': {
      return `${methodName}(): ${returnType[methodType]}`;
    }
    case 'clickButtonInList': {
      return `${methodName}(index: number): ${returnType[methodType]}`;
    }
    case 'getNumberOfItems': {
      return `${methodName}(): ${returnType[methodType]}`;
    }
    default: {
      return `${methodName}()`;
    }
  }
};

/**
 * Get the implementation of the function
 *
 * @param methodType  the type of the method
 * @param classPropSelector the selector class property
 * @returns the implementation of the function
 */
export const getImplementation = (
  methodType: MethodType,
  classPropSelector: string
) => {
  switch (methodType) {
    case 'clickOnButton': {
      return `{
    const elt = await this.query(this.${classPropSelector});
    return this.throwOnUndefined(elt).click();
  }`;
    }
    case 'getText': {
      return `{
    const elt = await this.query(this.${classPropSelector});
    return this.throwOnUndefined(elt).getText();
  }`;
    }
    case 'getInputValue': {
      return `{
    const elt = await this.query(this.${classPropSelector});
    return this.throwOnUndefined(elt).getValue();
  }`;
    }
    case 'setInputValue': {
      return `{
    const elt = await this.query(this.${classPropSelector});
    return this.throwOnUndefined(elt).setValue(value);
  }`;
    }
    case 'getTextInList': {
      return `{
    const elements = await this.queryAll(this.${classPropSelector});
    return this.throwOnUndefined(elements[index]).getText();
  }`;
    }
    case 'clickButtonInList': {
      return `{
    const elements = await this.queryAll(this.${classPropSelector});
    return this.throwOnUndefined(elements[index]).click();
  }`;
    }
    case 'getNumberOfItems': {
      return `{
    const elements = await this.queryAll(this.${classPropSelector});
    return elements.length;
  }`;
    }
    default: {
      return `{
    throw new Error('not handled');
  }`;
    }
  }
};
