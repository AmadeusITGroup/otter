import { strings } from '@angular-devkit/core';
import type { LoggerApi } from '@angular-devkit/core/src/logger';
import { ConfigDocParser } from '@o3r/extractors';
import { promises as fs } from 'node:fs';
import * as glob from 'globby';
import * as path from 'node:path';
import { lastValueFrom, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import * as ts from 'typescript';
import * as tjs from 'typescript-json-schema';
import { Action, allDefaultSupportedTypes, allSupportedTypes, FactSupportedTypes, MetadataFact, MetadataOperator, MetadataOperatorSupportedTypes } from './rules-engine.extractor.interfaces';

/**
 * Extracts rules engine facts and operator from code
 */
export class RulesEngineExtractor {

  /** Interface of a Fact definition */
  public static readonly FACT_DEFINITIONS_INTERFACE = 'FactDefinitions';
  /** Interface of an operator definition */
  public static readonly OPERATOR_DEFINITIONS_INTERFACES = ['Operator', 'UnaryOperator'];
  /** Interface of an action definition */
  public static readonly OPERATOR_ACTIONS_INTERFACE = 'RulesEngineAction';
  /** Reserved fact names that will be filtered out of metadata */
  public static readonly RESERVED_FACT_NAMES: Readonly<string[]> = ['portalFacts'];

  /** TSConfig to parse the code  */
  private tsconfig: any;

  /** Instance of the comment parser */
  private commentParser = new ConfigDocParser();

  constructor(tsconfigPath: string, private basePath: string, private logger: LoggerApi) {
    const {config} = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    this.tsconfig = config;
  }

  /**
   * Extract type definition of a type reference into schema file
   *
   * @param type Name of the type to extract
   * @param sourceFile path to the code source file
   * @param outputPath path to the schema file to generate
   */
  private async extractTypeRef(type: string, sourceFile: string, outputPath: string) {
    const internalLibFiles = this.tsconfig.extraOptions?.otterSubModuleRefs?.length > 0 ?
      await lastValueFrom(zip(...(this.tsconfig.extraOptions?.otterSubModuleRefs as string[]).map((value: string) => glob(value))).pipe(
        map((globFiles: string[][]) =>
          globFiles.reduce((acc, files) => [
            ...acc,
            ...files.map(f => path.resolve(f))
          ], [])
        )
      )) : [];
    internalLibFiles.push(sourceFile);
    const program = tjs.getProgramFromFiles(internalLibFiles, this.tsconfig.compilerOptions, this.basePath);
    const settings: tjs.PartialArgs = {
      required: true,
      aliasRef: this.tsconfig.compilerOptions?.paths,
      ignoreErrors: true
    };
    const schema = tjs.generateSchema(program, type, settings);
    if (schema?.definitions?.['utils.Date']) {
      schema.definitions['utils.Date'] = {type: 'string', format: 'date'};
    }
    if (schema?.definitions?.['utils.DateTime']) {
      schema.definitions['utils.DateTime'] = {type: 'string', format: 'date-time'};
    }
    return fs.writeFile(outputPath, JSON.stringify(schema, null, 2));
  }

  /**
   * Extract the type node used to generate the type metadata.
   * In the case of an array, it will look for the child node with the relevant information
   *
   * @param typeNode
   * @private
   */
  private extractTypeNode(typeNode: ts.TypeNode) {
    return ts.isArrayTypeNode(typeNode) ?
      (ts.isParenthesizedTypeNode(typeNode.elementType) ? typeNode.elementType.type : typeNode.elementType) :
      typeNode;
  }

  /**
   * Return the list of types matching the type node. If the type is not supported, it will be replaced with an unknown entry
   *
   * @param type
   * @param source
   * @private
   */
  private extractSimpleTypesData(type: ts.TypeNode, source: ts.SourceFile): (MetadataOperatorSupportedTypes | 'unknown')[] {
    if (type.kind === ts.SyntaxKind.UnknownKeyword) {
      return ['unknown'];
    }
    if (type.kind === ts.SyntaxKind.AnyKeyword) {
      return allSupportedTypes;
    } else {
      const typeText = type.getText(source).replace('Date', 'date');
      if (typeText === 'SupportedSimpleTypes') {
        return allDefaultSupportedTypes;
      } else if (typeText === 'dateInput') {
        return ['date', 'string', 'number'];
      }
      return [type.getText(source).replace('Date', 'date')] as [MetadataOperatorSupportedTypes];
    }
  }

  /**
   * Return the nbValue number associated to the simple type.
   * If it is an array, it will be -1
   * If it is an unknown type (or any), it will return 0
   * If it is any other type of object it will return 1
   *
   * @param type
   * @private
   */
  private getTypeNbValue(type: ts.TypeNode): number {
    if (type.kind === ts.SyntaxKind.UnknownKeyword || type.kind === ts.SyntaxKind.AnyKeyword) {
      return 0;
    } else if (ts.isArrayTypeNode(type)) {
      return -1;
    }
    return 1;
  }

  /**
   * Construct a metadata object that will describe the operator hand type as a list of types and a nbValue describing
   * the structure of the operand
   * nbValue reflects whether the operand support a single object (1), an array (-1), both (0) or a n-tuple (n)
   *
   * @param type
   * @param source
   * @param nbValue
   * @private
   */
  private extractComplexTypeData(type: ts.TypeNode, source: ts.SourceFile, nbValue: number): { types: (MetadataOperatorSupportedTypes | 'unknown')[]; nbValue: number} {
    if (ts.isUnionTypeNode(type)) {
      return type.types.reduce((acc: { types: (MetadataOperatorSupportedTypes | 'unknown')[]; nbValue: number | undefined}, t) => {
        const childTypeNode = this.extractTypeNode(t);
        const childNbValue = this.getTypeNbValue(t);
        const childType = this.extractSimpleTypesData(childTypeNode, source);
        return {
          types: Array.from(new Set([...acc.types, ...childType])),
          // If union is of type array, it takes precedence over child types
          // (any[], string)[] will be considered as an array and no an "anything goes" type
          // Else, it will compare between the children and return 0 if the child nb values differ
          nbValue: nbValue === -1 ? -1 : (!!acc.nbValue && acc.nbValue !== childNbValue ? 0 : childNbValue)
        };
      }, { types: [], nbValue: undefined }) as { types: (MetadataOperatorSupportedTypes | 'unknown')[]; nbValue: number};
    } else if (ts.isTupleTypeNode(type)) {
      return {
        types: Array.from(new Set(type.elements.flatMap((elementTypeNode) =>
          (ts.isUnionTypeNode(elementTypeNode) ? elementTypeNode.types : [elementTypeNode]).flatMap((typeNode) =>
            this.extractSimpleTypesData(typeNode, source))
        ))),
        nbValue: type.elements.length
      };
    }
    return {types: this.extractSimpleTypesData(type, source), nbValue: nbValue};
  }

  /**
   * Extract facts from source code
   *
   * @param sourceFile path to the code source file
   * @param schemaFolderFullPath full path to the schema folder
   * @param schemaFolderRelativePath path to the schema folder from the metadata file
   */
  public async extractFacts(sourceFile: string, schemaFolderFullPath: string, schemaFolderRelativePath: string): Promise<MetadataFact[]> {
    const program = ts.createProgram([sourceFile], this.tsconfig);
    const source = program.getSourceFile(sourceFile);

    const facts: Promise<MetadataFact>[] = [];

    source?.forEachChild((node) => {
      if (ts.isInterfaceDeclaration(node) && node.heritageClauses?.some((clause) => clause.types.some((type) => type.getText(source) === RulesEngineExtractor.FACT_DEFINITIONS_INTERFACE))) {
        facts.push(
          ...node.members
            .filter(ts.isPropertySignature)
            .filter((prop) => {
              const name = prop.name.getText(source);
              if (RulesEngineExtractor.RESERVED_FACT_NAMES.indexOf(name) > -1) {
                this.logger.error(`Fact named "${name}" found in ${sourceFile} has a reserved name and will be ignored by the extractor, please consider renaming it.`);
                return false;
              }
              return true;
            })
            .map(async (prop) => {
              const name = prop.name.getText(source);
              const description = this.commentParser.parseConfigDocFromNode(source, prop)?.description;
              // eslint-disable-next-line max-len
              if (!prop.type || !this.isNativeType(prop.type) && !ts.isTypeReferenceNode(prop.type) && !ts.isUnionTypeNode(prop.type)) {
                throw new Error(`The fact ${name} has an unsupported type "${prop.type?.getText(source) || 'unknown'}" in ${sourceFile}`);
              }

              let mainType = prop.type;
              if (ts.isUnionTypeNode(mainType)) {
                const mainTypes = mainType.types.filter((t) =>
                  t.kind !== ts.SyntaxKind.NullKeyword && t.kind !== ts.SyntaxKind.UndefinedKeyword &&
                  !(ts.isLiteralTypeNode(t) && (t.literal.kind === ts.SyntaxKind.NullKeyword || t.literal.kind === ts.SyntaxKind.UndefinedKeyword))
                );
                if (mainTypes.length !== 1) {
                  throw new Error(`The fact ${name} has an unsupported union-type "${prop.type?.getText(source) || 'unknown'}" in ${sourceFile}`);
                }
                mainType = mainTypes[0];
              }

              const typeName = mainType.getText(source);
              const type = ts.isTypeReferenceNode(mainType) && typeName !== 'Date' ? 'object' : typeName.replace('Date', 'date') as FactSupportedTypes;

              const fact: MetadataFact = {
                name,
                description,
                type
              };

              if (type === 'object') {
                const schemaFile = `${strings.dasherize(typeName)}.schema.json`;
                try {
                  await this.extractTypeRef(typeName, sourceFile, path.resolve(schemaFolderFullPath, schemaFile));
                  fact.schemaFile = path.join(schemaFolderRelativePath, schemaFile).replace(/[\\]/g, '/');
                } catch {
                  this.logger.warn(`Error when parsing ${type} in ${sourceFile}`);
                }
              }
              return fact;
            })
        );
      }
    });

    return Promise.all(facts);
  }

  /**
   * Check if typescript type node is a native type or a list of native element
   *
   * @param type
   */
  public isNativeType(type: ts.TypeNode) {
    return [ts.SyntaxKind.BooleanKeyword, ts.SyntaxKind.NumberKeyword, ts.SyntaxKind.StringKeyword].some(
      (typeKind) => typeKind === type.kind || ts.isArrayTypeNode(type) && type.elementType.kind === typeKind
    );
  }

  /**
   * Extract operators from source code
   *
   * @param sourceFile path to the code source file
   */
  public extractOperators(sourceFile: string): MetadataOperator[] {
    const program = ts.createProgram([sourceFile], this.tsconfig);
    const source = program.getSourceFile(sourceFile);

    const operators: MetadataOperator[] = [];
    source?.forEachChild((node) => {
      if (ts.isVariableStatement(node)) {
        const operatorDeclarations = node.declarationList.declarations.filter((declaration): declaration is (typeof declaration & { type: ts.TypeReferenceNode }) =>
          !!declaration.type && ts.isTypeReferenceNode(declaration.type) && RulesEngineExtractor.OPERATOR_DEFINITIONS_INTERFACES.includes(declaration.type.typeName.getText(source))
        );
        if (!operatorDeclarations.length) {
          return;
        }

        operatorDeclarations.forEach((declaration) => {
          const operatorType = declaration.type.typeName.getText(source);
          const commentParsedDeclaration = this.commentParser.parseConfigDocFromNode(source, declaration);
          const commentParsedNode = this.commentParser.parseConfigDocFromNode(source, node);
          const operator: MetadataOperator = {
            id: declaration.name.getText(source),
            description: commentParsedDeclaration?.description || commentParsedNode?.description || '',
            display: commentParsedDeclaration?.title || commentParsedNode?.title || '',
            leftOperand: {
              types: allDefaultSupportedTypes,
              nbValues: 1
            }
          };
          if (operatorType === 'Operator') {
            operator.rightOperand = {
              types: allDefaultSupportedTypes,
              nbValues: 1
            };
          }

          declaration.type.typeArguments?.forEach((argType, idx) => {
            const operand = idx === 0 ? 'leftOperand' : 'rightOperand';
            const operandObject = operator[operand]!;

            operandObject.nbValues = this.getTypeNbValue(argType);

            const typeNode = this.extractTypeNode(argType);
            if (typeNode.kind === ts.SyntaxKind.UndefinedKeyword) {
              delete operator[operand];
            } else {
              const typeData = this.extractComplexTypeData(typeNode, source, operandObject.nbValues);
              operandObject.nbValues = typeData.nbValue;
              operandObject.types = typeData.types;
              if (operandObject.types.some((type) => type !== 'unknown' && allSupportedTypes.indexOf(type) === -1)) {
                this.logger.warn(`Operator ${operator.id} has an unsupported type in operand ${operand}: "${operandObject.types.join(', ')}"`);
                operandObject.types = ['unknown'];
              }
            }
          });

          operators.push(operator);
        });
      }
    });
    return operators;
  }

  /**
   * Not used for the moment, kept for later updates
   *
   * @param sourceFile
   */
  public extractActions(sourceFile: string): Action[] {
    const program = ts.createProgram([sourceFile], this.tsconfig);
    const source = program.getSourceFile(sourceFile);

    const actions: Action[] = [];

    source?.forEachChild((node) => {
      if (ts.isClassDeclaration(node) &&
        node.heritageClauses?.some((nodeHeritage) => nodeHeritage.types.some((tNode) => tNode.expression.getText(source) === RulesEngineExtractor.OPERATOR_ACTIONS_INTERFACE))) {
        let parameters: Record<string, string> | undefined;

        node.heritageClauses.forEach((nodeHeritage) => {
          nodeHeritage.types
            .forEach((tNode) => {
              if (tNode.expression.getText(source) === RulesEngineExtractor.OPERATOR_ACTIONS_INTERFACE && tNode.typeArguments) {
                tNode.typeArguments
                  .filter(ts.isTypeLiteralNode)
                  .forEach((argNode) => argNode.members
                    .filter(ts.isPropertySignature)
                    .forEach((memberNode) => {
                      if (memberNode.name && memberNode.type) {
                        parameters ||= {};
                        parameters[memberNode.name.getText(source)] = memberNode.type.getText(source);
                      }
                    })
                  );
              }
            });
        });

        const type = node.members
          .filter(ts.isPropertyDeclaration)
          .find((methodNode) => methodNode.name.getText(source) === 'name')
          ?.initializer?.getText(source).replace(/^['"](.*)['"]$/, '$1');

        if (!type) {
          this.logger.error(`No type found for ${node.name?.getText(source) || 'unknown class'} in ${sourceFile}. It will be skipped.`);
          return;
        }

        actions.push({
          type,
          parameters,
          description: this.commentParser.parseConfigDocFromNode(source, node)?.description || ''
        });
      }
    });

    return actions;
  }
}
