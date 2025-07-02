import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  pathToFileURL,
} from 'node:url';
import {
  getLibraryCmsMetadata,
} from '@o3r/extractors';
import {
  O3rCliError,
} from '@o3r/schematics';
import {
  AsyncCompiler,
  CalculationInterpolation,
  CalculationOperation,
  CalculationValue,
  initAsyncCompiler,
  SassCalculation,
  SassColor,
  sassFalse,
  SassList,
  SassMap,
  SassNumber,
  SassString,
  sassTrue,
  StringOptions,
  Value,
} from 'sass-embedded';
import type {
  StyleExtractorBuilderSchema,
} from '../schema';
import type {
  CssMetadata,
  CssVariable,
  CssVariableType,
} from '@o3r/styling';

/**
 * This method will iterate on all characters in str and return the substring that is balanced which corresponds to a var declaration.
 * @param str
 */
export const getVarDeclaration = (str: string): string | null => {
  const varIndex = str.indexOf('var(');
  if (varIndex === -1) {
    return null;
  }

  let nbToClose = 0;
  for (let i = varIndex + 3; i < str.length; i++) {
    const char = str[i];
    if (char === '(') {
      nbToClose++;
    } else if (char === ')') {
      nbToClose--;

      if (nbToClose === 0) {
        return str.substring(varIndex, i + 1);
      }
    }
  }

  return str.substring(varIndex);
};

/**
 * CSS Variable extractor
 */
export class CssVariableExtractor {
  private static readonly asyncCompiler: Promise<AsyncCompiler> = initAsyncCompiler();
  private static readonly varRegex = /var\(\s*--(.*?)\s*,\s*(.*)\)/;
  private readonly cache: Record<string, URL> = {};

  constructor(public defaultSassOptions?: StringOptions<'async'>, private readonly builderOptions?: Pick<StyleExtractorBuilderSchema, 'ignoreInvalidValue'>) {}

  /**
   * Parse the CSS variable as reported
   * @param name CSS Variable name
   * @param value CSS Variable default value
   */
  private parseCssVariable(name: string, value = ''): CssVariable {
    const defaultValue = value.trim();
    const resultingCssVariable: CssVariable = { name, defaultValue };
    let remainingValue = defaultValue;
    let referenceMatch: RegExpExecArray | null;
    const references: Record<string, CssVariable> = {};
    do {
      const varDeclaration = getVarDeclaration(remainingValue);
      if (varDeclaration === null) {
        // No more var() references
        break;
      } else {
        referenceMatch = CssVariableExtractor.varRegex.exec(varDeclaration);
        if (referenceMatch) {
          const refName = referenceMatch[1];
          references[refName] = this.parseCssVariable(refName, referenceMatch[2]);
          remainingValue = remainingValue.replace(varDeclaration, '');
        }
      }
    } while (referenceMatch);
    if (Object.keys(references).length > 0) {
      resultingCssVariable.references = Object.values(references);
    }
    return resultingCssVariable;
  }

  /**
   * Type predicate for SassCalculation
   * @param value
   */
  private static isSassCalculation(value: Value | undefined): value is SassCalculation {
    return !!value && (value as any).name === 'calc';
  }

  /**
   * Get CSS String for given color
   * @param color Sass Color
   */
  private static getColorString(color: SassColor) {
    return color.alpha === 1
      ? `rgb(${color.channel('red')}, ${color.channel('green')}, ${color.channel('blue')})`
      : `rgba(${color.channel('red')}, ${color.channel('green')}, ${color.channel('blue')}, ${color.alpha})`;
  }

  /**
   * Returns the package name from an url
   * @param url
   */
  private static getPackageName(url: string): string {
    if (url.startsWith('bootstrap')) {
      return 'bootstrap';
    }
    return url.split('/').slice(0, 2).join('/');
  }

  private static extractTags(tags: Value): string[] | undefined {
    let contextTags: string[] | undefined;
    if (tags instanceof SassString) {
      contextTags = [tags.text];
    } else if (tags instanceof SassList) {
      contextTags = [];
      for (let i = 0; i < tags.asList.size; i++) {
        const item = tags.get(i);
        if (item instanceof SassString) {
          contextTags.push(item.text);
        }
      }
    } else if (tags instanceof SassMap) {
      const value = tags.contents.toArray().find(([key]) => key.toString() === 'value');
      if (value) {
        contextTags = CssVariableExtractor.extractTags(value[1]);
      }
    }
    return contextTags;
  }

  public static getCalcString(item: CalculationValue, isSubCalc: boolean): string {
    if (item instanceof SassNumber) {
      const value = item.value;
      const unit = item.numeratorUnits.get(0) ?? '';
      return value + unit;
    } else if (item instanceof SassString) {
      return item.text;
    } else if (item instanceof CalculationOperation) {
      return `${isSubCalc ? '(' : ''}${CssVariableExtractor.getCalcString(item.left, true)} ${item.operator} ${CssVariableExtractor.getCalcString(item.right, true)}${isSubCalc ? ')' : ''}`;
    } else if (item instanceof CalculationInterpolation) {
      return item.value;
    }
    return `calc(${item.arguments.toArray().map((arg) => CssVariableExtractor.getCalcString(arg, false)).join(' ')})`;
  }

  /**
   * Extract metadata from Sass Content
   * @param sassFilePath SCSS file URL
   * @param sassFileContent SCSS file content
   * @param additionalSassOptions
   */
  public async extractFileContent(sassFilePath: string, sassFileContent: string, additionalSassOptions?: StringOptions<'async'>) {
    const cssVariables: CssVariable[] = [];

    const options: StringOptions<'async'> = {
      ...this.defaultSassOptions,
      ...additionalSassOptions,
      loadPaths: [path.dirname(sassFilePath)],
      importers: [{
        findFileUrl: (url: string) => {
          if (this.cache[url]) {
            return this.cache[url];
          }

          if (!url.startsWith('~') && !url.startsWith('@')) {
            return null;
          }

          const cleanedUrl = url.replace('~', '');
          const moduleName = CssVariableExtractor.getPackageName(cleanedUrl);
          const subEntry = cleanedUrl.replace(moduleName, '.');
          const packageJsonPath = require.resolve(`${moduleName}/package.json`);
          const packagePath = path.dirname(packageJsonPath);
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
          const computedPathUrl = subEntry !== '.' && packageJson.exports?.[subEntry]
            ? path.join(packagePath, packageJson.exports[subEntry].sass
            || packageJson.exports[subEntry].scss || packageJson.exports[subEntry].css
            || packageJson.exports[subEntry].default)
            : path.join(packagePath, cleanedUrl.replace(moduleName, ''));
          const fileUrl = pathToFileURL(computedPathUrl);
          this.cache[url] = fileUrl;
          return fileUrl;
        }
      }],
      functions: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- format imposed by sass loader
        'metadata-report($name, $value, $details: null)': (args: Value[]) => {
          let contextTags: string[] | undefined;
          const varName = args[0] as SassString;
          const varValue = args[1];
          const details = args[2];
          let description: string | undefined;
          let label: string | undefined;
          let category: string | undefined;
          let type: CssVariableType | undefined;
          if (details) {
            if (details instanceof SassMap) {
              for (const [key, value] of details.contents.toArray()) {
                if (key instanceof SassString) {
                  switch (key.text) {
                    case 'description': {
                      if (value instanceof SassString) {
                        description = value.text;
                      }
                      break;
                    }
                    case 'label': {
                      if (value instanceof SassString) {
                        label = value.text;
                      }
                      break;
                    }
                    case 'type': {
                      if (value instanceof SassString) {
                        type = value.text as CssVariableType;
                      }
                      break;
                    }
                    case 'category': {
                      if (value instanceof SassString) {
                        category = value.text;
                      }
                      break;
                    }
                    case 'tags': {
                      contextTags = CssVariableExtractor.extractTags(value);
                      break;
                    }
                    default: {
                      // eslint-disable-next-line no-console -- no other logger available
                      console.warn(`Unsupported property: ${key.text}`);
                      break;
                    }
                  }
                }
              }
            }
            if (!contextTags) {
              contextTags = CssVariableExtractor.extractTags(details);
            }
          }

          let parsedValue: string | undefined;
          if (varValue instanceof SassString || varValue instanceof SassNumber) {
            parsedValue = varValue.toString();
          } else if (varValue === sassTrue || varValue === sassFalse) {
            parsedValue = `${varValue.isTruthy}`;
          } else if (varValue instanceof SassColor) {
            parsedValue = CssVariableExtractor.getColorString(varValue);
          } else if (varValue instanceof SassList) {
            const invalidIndexes: number[] = [];
            const parsedValueItems: string[] = [];
            for (let i = 0; i < varValue.asList.size; i++) {
              const item = varValue.get(i);
              if (item instanceof SassString || item instanceof SassNumber) {
                parsedValueItems.push(item.toString());
              } else if (item === sassTrue || item === sassFalse) {
                parsedValueItems.push(`${item.isTruthy}`);
              } else if (item instanceof SassColor) {
                parsedValueItems.push(CssVariableExtractor.getColorString(item));
              } else if (CssVariableExtractor.isSassCalculation(item)) {
                parsedValueItems.push(`calc(${item.arguments.toArray().map((arg) => CssVariableExtractor.getCalcString(arg, false)).join(' ')})`);
              } else {
                invalidIndexes.push(i);
              }
            }
            parsedValue = parsedValueItems.join(' ');
            if (invalidIndexes.length > 0) {
              const message = `Invalid value in the list (indexes: ${invalidIndexes.join(', ')}) for variable ${varName.text}.`;
              if (this.builderOptions?.ignoreInvalidValue ?? true) {
                // eslint-disable-next-line no-console -- no other logger available
                console.warn(`${message} It will be ignored.`);
              } else {
                throw new O3rCliError(message);
              }
            }
          } else if (CssVariableExtractor.isSassCalculation(varValue)) {
            parsedValue = `calc(${varValue.arguments.toArray().map((arg) => CssVariableExtractor.getCalcString(arg, false)).join(' ')})`;
          } else if (varValue.realNull) {
            const message = `Invalid value for variable ${varName.text}.`;
            if (this.builderOptions?.ignoreInvalidValue ?? true) {
              // eslint-disable-next-line no-console -- no other logger available
              console.warn(`${message} It will be ignored.`);
              return new SassString(`[METADATA:VARIABLE] ${varName.text} : invalid value`);
            } else {
              throw new O3rCliError(message);
            }
          } else {
            if (!details) {
              // eslint-disable-next-line no-console -- no other logger available
              console.warn(`The value "null" of ${varName.text} is available only for details override`);
              return new SassString(`[METADATA:VARIABLE] ${varName.text} : invalid Null value`);
            }
          }

          const cssVariableObj = this.parseCssVariable(varName.text, parsedValue);
          const cssVariableDetails = {
            tags: contextTags,
            description,
            label,
            type: type || 'string',
            category
          };
          if (parsedValue === undefined) {
            const cssVariableIndex = cssVariables.findIndex(({ name }) => name === cssVariableObj.name);
            if (cssVariableIndex !== -1) {
              cssVariables[cssVariableIndex] = {
                ...cssVariables[cssVariableIndex],
                ...cssVariableDetails
              };
              return new SassString(`[METADATA:VARIABLE] update ${varName.text} details` + (contextTags ? ` (tags: ${contextTags.join(', ')})` : ''));
            }
            return new SassString(`[METADATA:VARIABLE] ${varName.text} : Failed to update details of undefined variable`);
          }

          cssVariables.push({
            ...cssVariableObj,
            ...cssVariableDetails
          });
          return new SassString(`[METADATA:VARIABLE] ${varName.text} : ${parsedValue}` + (contextTags ? ` (tags: ${contextTags.join(', ')})` : ''));
        }
      }
    };

    await (await CssVariableExtractor.asyncCompiler).compileStringAsync(sassFileContent, options);
    return cssVariables;
  }

  /**
   * Dispose the async compiler. Must be called once when extraction is done.
   */
  public async disposeAsyncCompiler() {
    await (await CssVariableExtractor.asyncCompiler).dispose();
  }

  /**
   * Extract metadata from Sass file
   * @param sassFilePath SCSS file to parse
   */
  public async extractFile(sassFilePath: string): Promise<CssVariable[]> {
    const sassFileContent = fs.readFileSync(sassFilePath, { encoding: 'utf8' });
    return await this.extractFileContent(sassFilePath, sassFileContent);
  }

  /**
   * Extract metadata
   * @param libraries List of libraries
   * @param current Metadata extracted for the current project
   */
  public extract(libraries: string[], current: CssMetadata): CssMetadata {
    return libraries
      .map((lib) => getLibraryCmsMetadata(lib))
      .filter(({ styleFilePath }) => !!styleFilePath)
      .map(({ styleFilePath }) => JSON.parse(fs.readFileSync(styleFilePath!, 'utf8')) as CssMetadata)
      .reduce<CssMetadata>((acc, libMetadata) => {
        return Object.keys(libMetadata.variables)
          .filter((key) => !!acc.variables[key])
          .reduce((libAcc, libKey) => {
            libAcc.variables[libKey] = libMetadata.variables[libKey];
            return libAcc;
          }, acc);
      }, { ...current });
  }
}
