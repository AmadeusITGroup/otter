import { logging } from '@angular-devkit/core';
import type { ConfigProperty, ConfigPropertyTypes, ConfigType, NestedConfiguration } from '@o3r/components';
import { CategoryDescription } from '@o3r/core';
import { ConfigDocParser } from '@o3r/extractors';
import { readFileSync } from 'node:fs';
import * as ts from 'typescript';

/** Information extracted from a configuration file */
export interface ConfigurationInformation {
  /** Name of the configuration */
  name: string;

  /** Title of the configuration */
  title?: string;

  /** Description of the configuration */
  description?: string;

  /** Configuration tags */
  tags?: string[];

  /** Configuration categories' descriptions */
  categories?: CategoryDescription[];
  /**
   * Determine if the configuration is runtime
   *
   * @note the current implementation set this value as `undefined` for all the components (only AppBuildConfiguration is set to `false` and AppRuntimeConfiguration is set to `true`)
   */
  runtime?: boolean;

  /** Determine if the configuration is an application configuration */
  isApplicationConfig?: boolean;

  /** List of properties of the configuration */
  properties: ConfigProperty[];
}

/** Information that represents a union type string literal that will be used for configuration */
export interface UnionTypeStringLiteral {
  /** The name of the union type */
  name: string;
  /** The possible options extracted from the string literal values */
  choices: string[];
}

/** Wrapper for the configuration, to add nested configuration */
export interface ConfigurationInformationWrapper {
  configurationInformation?: ConfigurationInformation;
  unionTypeStringLiteral: UnionTypeStringLiteral[];
  nestedConfiguration: ConfigurationInformation[];
}

/** Configuration file extractor */
export class ComponentConfigExtractor {
  /** List of all the configuration patterns that can be used inside a Page/Block or Component */
  public readonly COMPONENT_CONFIGURATION_INTERFACES: RegExp[] = [/^Configuration\s*<?/, new RegExp('AppBuildConfiguration' as ConfigType), new RegExp('AppRuntimeConfiguration' as ConfigType)];

  /** List of all the configuration patterns */
  public readonly CONFIGURATION_INTERFACES: RegExp[] = [...this.COMPONENT_CONFIGURATION_INTERFACES, /^NestedConfiguration$/];

  /** String to display in case of unknown type */
  public readonly DEFAULT_UNKNOWN_TYPE = 'unknown';

  /** Parser of configuration doc */
  private configDocParser: ConfigDocParser;

  /**
   * @param libraryName
   * @param strictMode
   * @param source Typescript SourceFile node of the file
   * @param logger Logger
   * @param filePath Path to the file to extract the configuration from
   * @param checker Typescript TypeChecker of the program
   * @param libraries
   */
  constructor(
    private libraryName: string,
    private strictMode: boolean,
    public source: ts.SourceFile,
    private logger: logging.LoggerApi,
    public filePath: string,
    public checker: ts.TypeChecker,
    public libraries: string[] = []
  ) {
    this.configDocParser = new ConfigDocParser();
  }


  /**
   * Handle error cases depending on the mode: throwing errors or logging warnings
   *
   * @param message the warning message to be logged
   * @param errorMessage the error message to be thrown. If not provided, the warning one will be used
   */
  private handleErrorCases(message: string, errorMessage?: string) {
    if (!this.strictMode) {
      this.logger.warn(`${message.replace(/([^.])$/, '$1.')} Will throw in strict mode.`);
    } else {
      throw new Error(errorMessage || message);
    }
  }

  /**
   * Verifies if an UnionType has strings elements.
   *
   * @param node Typescript node to be checked
   */
  private hasStringElements(node: ts.UnionTypeNode): boolean {
    return node.types.some((type) => ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal));
  }

  /**
   * Get the type from a property
   * If the type refers to a NestedConfiguration type, then it will be replaced with element
   * and a reference to the object will be returned
   *
   * @param node Typescript node to extract the data from
   * @param configurationWrapper the configuration wrapper containing nestedConfig and union type strings
   * @param source
   */
  private getTypeFromNode(node: ts.Node | undefined, configurationWrapper?: ConfigurationInformationWrapper, source: ts.SourceFile = this.source):
    {type: ConfigPropertyTypes; ref?: {library: string; name: string}; choices?: string[]} {
    const nestedConfiguration = configurationWrapper?.nestedConfiguration;
    const enumTypesAlias = configurationWrapper?.unionTypeStringLiteral;
    if (!node) {
      return {type: this.DEFAULT_UNKNOWN_TYPE};
    }
    if (ts.isParenthesizedTypeNode(node)) {
      return this.getTypeFromNode(node.type, configurationWrapper);
    } else if (ts.isArrayTypeNode(node)) {
      const typeNode = node.elementType;
      if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
        const importFromLibraries = source.statements.find((statement): statement is ts.ImportDeclaration & { moduleSpecifier: ts.StringLiteral } =>
          ts.isImportDeclaration(statement)
          && ts.isStringLiteral(statement.moduleSpecifier)
          && this.libraries.includes(statement.moduleSpecifier.text)
          && !!statement.importClause?.namedBindings
          && ts.isNamedImports(statement.importClause.namedBindings)
          && !!statement.importClause.namedBindings.elements.find((nameBinding) =>
            ts.isImportSpecifier(nameBinding)
            && ts.isIdentifier(nameBinding.name)
            && nameBinding.name.escapedText === typeNode.typeName.getText()
          )
        );
        if (importFromLibraries) {
          return {
            type: 'element[]',
            ref: {
              library: importFromLibraries.moduleSpecifier.text,
              name: typeNode.typeName.getText()
            }
          };
        } else if (configurationWrapper) {
          const type = this.checker.getTypeFromTypeNode(typeNode);
          const baseTypes = type.getBaseTypes();
          const extendsNested = !!baseTypes?.some((baseType) => baseType.symbol.escapedName.toString().match(/^NestedConfiguration$/));
          if (extendsNested) {
            const nestedFilePath: string = (type.symbol as any).parent.declarations[0].fileName;
            const nestedSourceFile = ts.createSourceFile(
              nestedFilePath,
              readFileSync(nestedFilePath).toString(),
              ts.ScriptTarget.ES2015,
              true
            );
            const nestedConfig = this.collectNestedConfiguration(nestedSourceFile);
            configurationWrapper.nestedConfiguration = [...(new Set(configurationWrapper.nestedConfiguration.concat(...nestedConfig.nestedConfiguration)))];
            configurationWrapper.unionTypeStringLiteral = [...(new Set(configurationWrapper.unionTypeStringLiteral.concat(...nestedConfig.unionTypeStringLiteral)))];
          }
        }
      }
      // CMS Team expects element[] type for nested configuration and a reference to the configuration
      const childType = this.getTypeFromNode(node.getChildren(source)[0], configurationWrapper);
      if ([this.DEFAULT_UNKNOWN_TYPE, 'string', 'number', 'boolean', 'enum'].includes(childType.type)) {
        return {type: childType.type + '[]' as ConfigPropertyTypes, choices: childType.type === 'enum' ? childType.choices : undefined};
      }
      return {type: 'element[]', ref: {
        library: this.libraryName,
        name: childType.type
      }};
    } else if (ts.isTypeReferenceNode(node)) {
      const name = node.getChildren(source)[0].getText(source) as ConfigPropertyTypes;
      if (nestedConfiguration && nestedConfiguration.some((nestedConfig) => nestedConfig.name === name)) {
        return {type: name};
      }
      const enumTypeAlias = enumTypesAlias?.find((enumType) => enumType.name === name);
      if (enumTypeAlias) {
        return {type: 'enum', choices: enumTypeAlias.choices};
      }

      const nodeType = this.checker.getTypeAtLocation(node);
      if (nodeType.isUnion()) {
        return {
          type: 'enum',
          choices: nodeType.types.map((type) => type.isLiteral() && type.isStringLiteral() && type.value || '')
        };
      }

      return {type: this.DEFAULT_UNKNOWN_TYPE};
    }
    if (ts.isUnionTypeNode(node) && this.hasStringElements(node)) {
      return {
        type: 'enum',
        choices: this.extractOptionsForEnum(node)
      };
    }
    // Handle the native types
    switch (node.kind) {
      case ts.SyntaxKind.StringKeyword: {
        return {type: 'string'};
      }
      case ts.SyntaxKind.BooleanKeyword: {
        return {type: 'boolean'};
      }
      case ts.SyntaxKind.NumberKeyword: {
        return {type: 'number'};
      }
      default: {
        return {type: this.DEFAULT_UNKNOWN_TYPE};
      }
    }
  }

  /**
   * Extract the property data from an interface property signature
   *
   * @param propertyNode Node to extract the data from
   * @param configurationWrapper the configuration wrapper containing nestedConfig and union type strings
   * @param source
   */
  private extractPropertySignatureData(propertyNode: ts.PropertySignature, configurationWrapper?: ConfigurationInformationWrapper, source: ts.SourceFile = this.source): ConfigProperty {
    const configDocInfo = this.configDocParser.parseConfigDocFromNode(source, propertyNode);
    const name = propertyNode.name.getText() || '';
    const res: ConfigProperty = {
      description: configDocInfo?.description || '',
      category: configDocInfo?.category,
      label: configDocInfo?.label ? configDocInfo.label : name.replace(/([A-Z])/g, ' $1'),
      name,
      type: 'unknown'
    };

    if (propertyNode.questionToken) {
      this.handleErrorCases(`${propertyNode.name.getText()} property has been identified as optional, which is not cms compliant`);
    }

    const typeFromNode = this.getTypeFromNode(propertyNode.type, configurationWrapper, source);
    res.type = typeFromNode.type;
    res.reference = typeFromNode.ref;
    res.choices = typeFromNode.choices;

    if ((res.type === 'enum' || res.type === 'enum[]') && !res.choices) {
      this.handleErrorCases(`${res.name} property should be treated as ENUM but it is not an UnionType nor a TypeReference. This is not cms compliant`);
    }

    return res;
  }

  /**
   * Extract the possible options in case of an enum node
   *
   * @param node Node to extract the data from
   * @param source
   */
  private extractOptionsForEnum(node: ts.UnionTypeNode, source: ts.SourceFile = this.source): string[] {
    const options: string[] = [];
    node.types.forEach((type) => {
      if (ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) {
        options.push(type.literal.text);
      } else {
        this.handleErrorCases(
          `${node.getText(source)} is a UnionType that does not have literal elements. This is not cms compliant`);
      }
    });
    return options;
  }

  /**
   * Get the configuration properties from a given interface node
   *
   * @param interfaceNode Node of a typescript interface
   * @param configurationWrapper
   * @param source
   */
  private getPropertiesFromConfigurationInterface(
    interfaceNode: ts.InterfaceDeclaration,
    configurationWrapper?: ConfigurationInformationWrapper,
    source: ts.SourceFile = this.source
  ): ConfigurationInformation | undefined {
    let isConfiguration = false;
    let runtime: boolean | undefined;
    let name: string | undefined;
    const properties: ConfigProperty[] = [];
    const categoriesOnProps: string[] = [];

    interfaceNode.forEachChild((node) => {
      if (ts.isIdentifier(node)) {
        name = node.getText(source);
      } else if (ts.isHeritageClause(node)) {
        node.getChildren(source).forEach((extendedInterfaceNode) => {
          const content = extendedInterfaceNode.getText(source);
          isConfiguration = isConfiguration || this.CONFIGURATION_INTERFACES.some((r) => r.test(content));
          if (typeof runtime === 'undefined') {
            if (new RegExp('AppBuildConfiguration' as ConfigType).test(content)) {
              runtime = false;
            } else {
              runtime = new RegExp('AppRuntimeConfiguration' as ConfigType).test(content) || undefined;
            }
          }
        });

      } else if (isConfiguration && ts.isPropertySignature(node)) {
        const property: ConfigProperty = this.extractPropertySignatureData(node, configurationWrapper, source);
        properties.push(property);
        if (property.category && categoriesOnProps.indexOf(property.category) === -1) {
          categoriesOnProps.push(property.category);
        }
      }
    });

    const isApplicationConfig: boolean | undefined = typeof runtime !== 'undefined';

    if (isConfiguration) {
      this.logger.debug(`Extracted configuration ${name!} from interface with properties: ${properties.map((p) => `(${p.name}: ${p.type})`).join(', ')}`);
    } else {
      this.logger.debug(`${name!} is ignored because it is not a configuration`);
    }
    const configDocInfo = this.configDocParser.parseConfigDocFromNode(source, interfaceNode);

    if (configDocInfo && configDocInfo.categories) {
      for (const describedCategory of configDocInfo.categories) {
        if (categoriesOnProps.indexOf(describedCategory.name) === -1) {
          this.handleErrorCases(`Description found for category "${describedCategory.name}" but no property has this category.`);
        }
      }
    }
    return isConfiguration && name ? { name, properties, runtime, isApplicationConfig, ...configDocInfo } : undefined;
  }

  /**
   * Extract the default value of a configuration interface
   *
   * @param variableNode Typescript node of the default constant implementing the interface
   * @param configurationInformationWrapper Configuration object extracted from the interface
   */
  private getDefaultValueFromConfigurationInterface(variableNode: ts.VariableStatement, configurationInformationWrapper: ConfigurationInformationWrapper): ConfigurationInformation {
    variableNode.forEachChild((varNode) => {
      if (ts.isVariableDeclarationList(varNode)) {
        varNode.forEachChild((declarationNode) => {
          if (ts.isVariableDeclaration(declarationNode)) {
            let isConfigImplementation = false;
            declarationNode.forEachChild((vNode) => {
              if (ts.isTypeReferenceNode(vNode) && configurationInformationWrapper.configurationInformation!.name === vNode.getText(this.source)) {
                isConfigImplementation = true;
              } else if (isConfigImplementation && ts.isObjectLiteralExpression(vNode)) {
                vNode.forEachChild((propertyNode) => {
                  if (ts.isPropertyAssignment(propertyNode)) {
                    let identifier: string | undefined;
                    propertyNode.forEachChild((fieldNode) => {
                      if (ts.isIdentifier(fieldNode)) {
                        identifier = fieldNode.getText(this.source);
                      } else if (identifier) {
                        const property = configurationInformationWrapper.configurationInformation!.properties.find((prop) => prop.name === identifier);
                        if (property) {
                          if (ts.isArrayTypeNode(fieldNode) || ts.isArrayLiteralExpression(fieldNode)) {
                            property.values = [];
                            let typeReplacement: ConfigPropertyTypes | undefined;
                            fieldNode.forEachChild((arrayItem) => {
                              if (ts.isStringLiteral(arrayItem)) {
                                // Handle string (StringLiteral = 10)
                                property.values!.push(this.removeQuotationMarks(arrayItem.getText(this.source)));
                              } else if (
                                ts.isObjectLiteralExpression(arrayItem)
                                && property.reference
                                && this.isTypedNestedConfiguration(property.reference.name, configurationInformationWrapper, this.libraries)
                              ) {
                                let defaultValuesMapArrayItem: NestedConfiguration = {};
                                arrayItem.forEachChild((arrayItemProperty) => {
                                  if (ts.isPropertyAssignment(arrayItemProperty)) {
                                    if (ts.isStringLiteral(arrayItemProperty.name)) {
                                      arrayItemProperty.name.getText(this.source);
                                    }
                                  }
                                  // Build the property map pushing all the key/value from the default config
                                  // getChildAt(0, this.source) is the key, getChildAt(1, this.source) the ":" and getChildAt(2, this.source) the value
                                  defaultValuesMapArrayItem = {
                                    ...defaultValuesMapArrayItem,
                                    [this.removeQuotationMarks(arrayItemProperty.getChildAt(0, this.source).getText(this.source))]:
                                      this.removeQuotationMarks(arrayItemProperty.getChildAt(2, this.source).getText(this.source))
                                  };
                                });
                                property.values!.push(defaultValuesMapArrayItem);
                              } else {
                                console.warn(`Unsupported type found will be ignored with kind = ${arrayItem.kind} and value = ${arrayItem.getText(this.source)}`);
                              }
                            });
                            if (typeReplacement) {
                              property.type = typeReplacement;
                            }
                          } else {
                            property.value = this.removeQuotationMarks(fieldNode.getText(this.source));
                          }
                        }
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return configurationInformationWrapper.configurationInformation!;
  }

  /**
   * Remove all quotation marks from the input string to prevent any ""my_string"" and "'my_string'" in the metadata file
   *
   * @param inputString that needs to be format
   */
  private removeQuotationMarks(inputString: string) {
    return inputString.replace(/^['"](.*)['"]$/, '$1');
  }

  /**
   * Check is name is typed as a known nested configuration
   *
   * @param propertyName
   * @param nestedConfiguration List of nested configuration
   * @param libraries
   */
  private isTypedNestedConfiguration(propertyName: string, nestedConfiguration: ConfigurationInformationWrapper, libraries: string[]) {
    if (!nestedConfiguration.configurationInformation) {
      return false;
    }

    // Get the property object associated to propertyName
    const property = nestedConfiguration.configurationInformation.properties.find((prop) => prop.reference?.name === propertyName);
    if (!property) {
      return false;
    }

    if (property.reference?.library && libraries.includes(property.reference.library)) {
      return true;
    }

    // Extract the type associated to the property
    const associatedInterface = property.reference?.name;
    // Check if the interface is a known nested configuration
    const result = nestedConfiguration.nestedConfiguration.some((configurationInformation) => configurationInformation.name === associatedInterface);
    if (!result) {
      this.logger.warn(`${propertyName} default value will be ignored because it's not typed as nested configuration`);
    }
    return result;
  }

  /**
   * This function checks if the interface name given as parameter is extended by the interface node
   *
   * @param interfaceDeclaration
   * @param extendedInterfaceNames
   * @param source
   */
  private isExtending(interfaceDeclaration: ts.InterfaceDeclaration, extendedInterfaceNames: RegExp[], source: ts.SourceFile = this.source): boolean {
    if (!interfaceDeclaration.heritageClauses) {
      return false;
    }
    return interfaceDeclaration.heritageClauses.some((heritageClause: ts.HeritageClause) => {
      return heritageClause.types.some((type) => {
        return extendedInterfaceNames.some((r) => r.test(type.expression.getText(source)));
      });
    });
  }

  /**
   * Fill the nested configuration with default values
   *
   * @param nestedConfigurationInformation
   */
  private fillNestedConfigurationDefaultValues(nestedConfigurationInformation: ConfigurationInformation | undefined) {
    if (!nestedConfigurationInformation) {
      return;
    }
    nestedConfigurationInformation.properties.forEach(((property) => {
      switch (property.type) {
        case 'string': {
          property.value = '';
          break;
        }
        case 'boolean': {
          property.value = 'false';
          break;
        }
        case 'number': {
          property.value = '0';
          break;
        }
        case 'enum': {
          property.value = property.choices?.[0];
          break;
        }
      }
    }));
    return nestedConfigurationInformation;
  }

  /**
   * Collect nested configuration information
   *
   * @param source
   */
  private collectNestedConfiguration(source: ts.SourceFile): ConfigurationInformationWrapper {
    const configurationInformationWrapper: ConfigurationInformationWrapper = { nestedConfiguration: [], unionTypeStringLiteral: [] };

    source.forEachChild((node) => {
      if (ts.isTypeAliasDeclaration(node) && ts.isUnionTypeNode(node.type) && this.hasStringElements(node.type)) {
        configurationInformationWrapper.unionTypeStringLiteral.push({
          name: node.name.getText(source),
          choices: this.extractOptionsForEnum(node.type, source)
        });
      }
      if (ts.isInterfaceDeclaration(node)) {
        // If it extends NestedConfiguration, we consider it as an independent NestedConfig
        if (this.isExtending(node, [/NestedConfiguration/], source)) {
          let nestedConfigurationInformation = this.getPropertiesFromConfigurationInterface(node, configurationInformationWrapper, source);
          nestedConfigurationInformation = this.fillNestedConfigurationDefaultValues(nestedConfigurationInformation);
          if (nestedConfigurationInformation) {
            // We add it to the list of Nested config if the result is not undefined
            configurationInformationWrapper.nestedConfiguration.push(nestedConfigurationInformation);
          }
        }
      }
    });

    return configurationInformationWrapper;
  }

  /**
   * Extract the configuration of a typescript file
   */
  public extract() {
    this.logger.debug(`Parsing configuration from ${this.filePath}`);

    let configInterfaceFound = false;
    // First Iteration to collect the nested configuration interfaces
    const configurationInformationWrapper = this.collectNestedConfiguration(this.source);

    // Here the source represent the structure that has been extracted from a single file
    // Each child represents a part of the file parsed and interpreted
    // Keep in mind that the ORDER is very important here, the default values need to be declared AFTER the config interface
    // If we have the need to improve that in the future, we could split in several iterations (probably a few ms added to the parsing time)
    this.source.forEachChild((node) => {
      if (ts.isInterfaceDeclaration(node)) {
        // If it extends Configuration, we consider that it's the config interface
        if (!configurationInformationWrapper.configurationInformation && this.isExtending(node, this.COMPONENT_CONFIGURATION_INTERFACES)) {
          configInterfaceFound = true;
          // If the result of getPropertiesFromConfigurationInterface is undefined, we continue to loop on children
          configurationInformationWrapper.configurationInformation = this.getPropertiesFromConfigurationInterface(node, configurationInformationWrapper);
        }
        // If the config interface have been found, we need to look for the default value in the next child
      } else if (configInterfaceFound && configurationInformationWrapper.configurationInformation && ts.isVariableStatement(node)) {
        configurationInformationWrapper.configurationInformation = this.getDefaultValueFromConfigurationInterface(node, configurationInformationWrapper);
      }
    });
    return configurationInformationWrapper;
  }
}
