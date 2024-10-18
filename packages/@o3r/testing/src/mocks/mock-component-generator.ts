import {
  Component,
  EventEmitter,
  forwardRef,
  Type
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import * as ts from 'typescript';

/**
 * Determine if the node in an input field
 * @param node Typescript AST Node
 * @param source Typescript source file
 */
function isInputNode(node: ts.Node, source: ts.SourceFile): node is ts.Decorator {
  return ts.isDecorator(node) && node.getText(source).startsWith('@Input');
}

/**
 * Determine if the node in an output field
 * @param node Typescript AST Node
 * @param source Typescript source file
 */
function isOutputNode(node: ts.Node, source: ts.SourceFile): node is ts.Decorator {
  return ts.isDecorator(node) && node.getText(source).startsWith('@Output');
}

/**
 * Get the name of the input / output
 * @param currentNode Typescript AST Node
 * @param decorator Current Input/Output decorator node
 * @param source Typescript source file
 */
function getIOName(currentNode: ts.Node, decorator: ts.Decorator, source: ts.SourceFile): string | undefined {
  const nameInDecorator = decorator.getText(source).match(/@(Input|Ouput) *\( *(['"](.*)['"])? *\) */i);
  if (nameInDecorator && nameInDecorator[3]) {
    return nameInDecorator[3];
  } else {
    let name: string | undefined;
    currentNode.forEachChild((node) => {
      if (ts.isIdentifier(node)) {
        name = node.getText(source);
      }
    });
    return name;
  }
}

/**
 * Get the list of Input and Output of a component
 * @param parentNode Typescript AST Node
 * @param source Typescript source file
 */
function parseIO(parentNode: ts.Node, source: ts.SourceFile): { outputs: string[]; inputs: string[] } {
  const outputs: string[] = [];
  const inputs: string[] = [];

  parentNode.forEachChild((node) => {
    if (isInputNode(node, source)) {
      const name = getIOName(parentNode, node, source);
      if (name) {
        inputs.push(name);
      }
    } else if (isOutputNode(node, source)) {
      const name = getIOName(parentNode, node, source);
      if (name) {
        outputs.push(name);
      }
    } else {
      const childrenResult = parseIO(node, source);
      inputs.push(...childrenResult.inputs);
      outputs.push(...childrenResult.outputs);
    }
  });

  return {
    outputs,
    inputs
  };
}

/**
 * Get the selector of an angular class
 * @param parentNode Typescript AST Node
 * @param source Typescript source file
 * @param isInDecorator true if the recursive execution is in a decorator
 * @param isInComponentConfig true if the recursive execution is in a component decorator configuration
 */
function getSelector(parentNode: ts.Node, source: ts.SourceFile, isInDecorator = false, isInComponentConfig = false) {
  let foundDecorator = false;
  let foundSelector = false;
  let ret: string | undefined;
  parentNode.forEachChild((node) => {
    if (isInDecorator && isInComponentConfig && ts.isIdentifier(node) && node.getText(source) === 'selector') {
      foundSelector = true;
    } else if (foundSelector && ts.isStringLiteral(node)) {
      ret = node.getText(source).replace(/['"]/ig, '');
    } else if (isInDecorator && ts.isIdentifier(node) && node.getText(source) === 'Component') {
      foundDecorator = true;
    } else if (isInDecorator && foundDecorator && ts.isObjectLiteralExpression(node)) {
      ret = ret || getSelector(node, source, isInDecorator, true);
    } else {
      ret = ret || getSelector(node, source, isInDecorator || ts.isDecorator(node), isInComponentConfig);
    }
  });
  return ret;
}

/**
 * Generate a mock class base on a component file
 * @param componentPath Path to the component file to mock
 * @param config Object containing the following configurations:
 * template: should be provided if the template contain `<ng-content></ng-content>`
 * isControlValueAccessor: should be provided if the component extends ControlValueAccessor
 * @param config.template
 * @param config.isControlValueAccessor
 * @example
 * ```typescript
 * // hero.component.ts
 * \@Component({selector: 'hero'})
 * class HeroComponent {
 *   \@Input() name: string;
 *   \@Output() doSomething: EventEmitter<void>
 * }
 *
 * // mock generation
 * class MockComponent extends generateMockComponent('hero.component.ts') {}
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function generateMockComponent<T extends unknown = Record<string, unknown>>(componentPath: string, config?: { template?: string; isControlValueAccessor?: boolean }): Type<T> {
  const program = ts.createProgram([componentPath], {});
  const source = program.getSourceFile(componentPath);
  if (!source) {
    throw new Error('No Source found');
  }

  const { outputs, inputs } = parseIO(source, source);
  const mock = class {
    public writeValue: any;
    public registerOnChange: any;
    public registerOnTouched: any;

    constructor() {
      Object.keys(outputs)
        .forEach((outputName) => (this as any)[outputName] = new EventEmitter<any>());
      if (config && config.isControlValueAccessor) {
        this.writeValue = () => {};
        this.registerOnChange = () => {};
        this.registerOnTouched = () => {};
      }
    }
  };

  return Component({
    template: config && config.template || '',
    selector: getSelector(source, source) || '',
    inputs,
    outputs,
    ...(config && config.isControlValueAccessor)
      ? {
        providers: [
          {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => mock),
            multi: true
          }
        ]
      }
      : {}
  })(mock) as Type<T>;
}
