import { logging } from '@angular-devkit/core';
import type { ComponentStructure } from '@o3r/components';
import { getLocalizationFileFromAngularElement } from '@o3r/extractors';
import { isO3rClassComponent } from '@o3r/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

/** Information extracted from a component file */
export interface ComponentInformation {
  /** Name of the component */
  name: string;
  /** Name of the configuration used by the component */
  configName?: string;
  /** Path to the configuration file used */
  configPath?: string;
  /** Determine if the component uses the configuration dynamically */
  isDynamicConfig: boolean;
  /** Name of the context used by the component */
  contextName?: string;
  /** Path to the context file used */
  contextPath?: string;
  /** Type of the component */
  type: ComponentStructure;
  /** Selector of the component */
  selector?: string;
  /**
   * Template URL of the component
   * @deprecated will be removed in v10
   */
  templateUrl?: string;
  /** Determine if the component is activating a ruleset */
  linkableToRuleset: boolean;
  /** List of localization keys used in the component */
  localizationKeys?: string[];
}

/**
 * Component class extractor.
 */
export class ComponentClassExtractor {

  /** List of interfaces that a configurable component can implement */
  public readonly CONFIGURABLE_INTERFACES: string[] = ['DynamicConfigurable', 'Configurable'];

  /**
   * @param source Typescript SourceFile node of the file
   * @param logger Logger
   * @param filePath Path to the file to extract the data from
   */
  constructor(public source: ts.SourceFile, private logger: logging.LoggerApi, public filePath: string) {
  }

  /**
   * Indicates if the given decorator is a component decorator.
   *
   * @param decoratorNode The decorator node to test
   */
  private isComponentDecorator(decoratorNode: ts.Decorator) {
    return new RegExp('^(@Component).*').test(decoratorNode.getText(this.source));
  }

  /**
   * Get the component type from the given decorator node.
   *
   * @param decoratorNode The decorator node to get the component type from
   */
  private getComponentType(decoratorNode: ts.Decorator): ComponentStructure | undefined {
    if (ts.isCallExpression(decoratorNode.expression)) {
      if (decoratorNode.expression.expression.getText(this.source) === 'O3rComponent') {
        const arg1 = decoratorNode.expression.arguments[0];
        if (ts.isObjectLiteralExpression(arg1)) {
          return this.getComponentStructure(
            arg1.properties
              .find((prop): prop is ts.PropertyAssignment => prop.name?.getText(this.source) === 'componentType')
              ?.initializer.getText(this.source)
          );
        }
      }
    }
  }

  /**
   * Get the component selector from the given decorator node.
   *
   * @param decoratorNode The decorator node to get the component selector from
   */
  private getComponentSelector(decoratorNode: ts.Decorator) {
    if (this.isComponentDecorator(decoratorNode)) {
      const matches = /selector:\s*['"](.*)['"]/.exec(decoratorNode.getText(this.source));
      if (matches) {
        return matches[1];
      }
    }
  }

  /**
   * Get the component template URL from the given decorator node.
   *
   * @param decoratorNode The decorator node to get the component template URL from
   * @deprecated will be removed in v10
   */
  private getComponentTemplateUrl(decoratorNode: ts.Decorator) {
    if (this.isComponentDecorator(decoratorNode)) {
      const matches = /templateUrl:\s*['"](.*)['"]/.exec(decoratorNode.getText(this.source));
      if (matches) {
        return matches[1];
      }
    }
  }

  /**
   * Sanitize component type by removing extra quotes
   * Example: "'Page'" becomes 'Page'
   *
   * @param type
   * @private
   */
  private sanitizeComponentType(type: string | undefined) {
    if (!type) {
      return;
    }
    return type.replaceAll(/['"]/g, '');
  }

  private getComponentStructure(type: string | undefined): ComponentStructure {
    const sanitizedType = this.sanitizeComponentType(type);
    switch (sanitizedType) {
      case 'Block':
        return 'BLOCK';
      case 'Page':
        return 'PAGE';
      case 'ExposedComponent':
        return 'EXPOSED_COMPONENT';
      default:
        return 'COMPONENT';
    }
  }

  /**
   * Extract component information of a given class node
   *
   * @param classNode Typescript node of a class
   */
  private getComponentInformation(classNode: ts.ClassDeclaration): ComponentInformation | undefined {
    const regExp = new RegExp(`^(${this.CONFIGURABLE_INTERFACES.join('|')})`);
    let configName: string | undefined;
    let contextName: string | undefined;
    let name: string | undefined;
    let isDynamic = false;
    let type: ComponentStructure = 'COMPONENT';
    let selector: string | undefined;
    let templateUrl: string | undefined;
    let linkableToRuleset = false;

    classNode.forEachChild((node) => {
      if (!configName && ts.isHeritageClause(node)) {
        node.forEachChild((implNode) => {
          const interfaceValue = implNode.getText(this.source);

          if (!configName && regExp.test(interfaceValue)) {
            configName = interfaceValue.replace(/.*<(.*?)\s*(,\s*('\w*')\s*)?>.*/, '$1');
            isDynamic = /^Dynamic/.test(interfaceValue);
          } else if (!contextName && interfaceValue.endsWith('Context')) {
            contextName = interfaceValue;
          } else {
            switch (interfaceValue) {
              case 'Block':
              case 'Page':
              case 'ExposedComponent':
                type = this.getComponentStructure(interfaceValue);
                this.logger.warn(`Interface ${interfaceValue} is deprecated, you should use the @O3rComponent decorator`);
                break;
              case 'LinkableToRuleset':
                linkableToRuleset = true;
                break;
            }
          }
        });
      } else if (ts.isDecorator(node)) {
        selector = this.getComponentSelector(node);
        templateUrl = this.getComponentTemplateUrl(node);
        type = this.getComponentType(node) || type;
      } else if (ts.isIdentifier(node)) {
        name = node.getText(this.source);
      }
    });

    if (configName) {
      this.logger.debug(`Extracted component ${name!} based on configuration ${configName}}`);
    } else {
      this.logger.debug(`${name!} is ignored because it is not a configurable component`);
    }

    const localizationFiles = getLocalizationFileFromAngularElement(classNode);

    const localizationKeys = (localizationFiles || []).reduce((acc: string[], file) => {
      const resolvedFilePath = path.resolve(path.dirname(this.filePath), file);
      const data = JSON.parse(fs.readFileSync(resolvedFilePath, 'utf-8'));
      return acc.concat(Object.keys(data));
    }, []);

    return name && type ? {
      name, configName, contextName, isDynamicConfig: isDynamic, type, selector, templateUrl, linkableToRuleset,
      ...(localizationKeys.length ? { localizationKeys } : {})
    } : undefined;
  }

  /**
   * Get the file path of the given class from the import
   *
   * @param contextName Name of the class to find in the imports
   * @param className
   */
  private getFilePath(className?: string): string | undefined {
    if (!className) {
      return undefined;
    }

    let res: string | undefined;
    this.source.forEachChild((node) => {
      if (!res && ts.isImportDeclaration(node)) {
        if (new RegExp(className).test(node.getText(this.source))) {
          const children = node.getChildren(this.source);
          res = children[children.length - 2].getText(this.source).replace(/^['"](.*)['"]/, '$1');
        }
      }
    });

    if (res && /^\./.test(res)) {
      res = path.resolve(path.dirname(this.filePath), `${res}.ts`).replace(/[\\/]/g, '/');
    }

    return res;
  }

  /**
   * Extract the component data of a typescript file
   */
  public extract() {
    this.logger.debug(`Parsing configuration from ${this.filePath}`);
    let componentInfo: ComponentInformation | undefined;

    this.source.forEachChild((node) => {
      if (!componentInfo && ts.isClassDeclaration(node) && isO3rClassComponent(node)) {
        componentInfo = this.getComponentInformation(node);
      }
    });

    if (componentInfo) {
      componentInfo.configPath = this.getFilePath(componentInfo.configName);
      componentInfo.contextPath = this.getFilePath(componentInfo.contextName);
    }

    return componentInfo;
  }

}
