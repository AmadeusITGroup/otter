import { getLibraryCmsMetadata } from '@o3r/extractors';
import { O3rCliError } from '@o3r/schematics';
import type { CssMetadata, CssVariable, CssVariableType } from '@o3r/styling';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import {
  compileString,
  SassBoolean,
  SassColor,
  SassList,
  SassMap,
  SassNumber,
  SassString,
  Value
} from 'sass';

/**
 * SassCalculation interface
 */
interface SassCalculation extends Value {
  name: 'calc';
  $arguments: string[];
}

/**
 * CSS Variable extractor
 */
export class CssVariableExtractor {
  private cache: Record<string, URL> = {};

  /**
   * Parse the CSS variable as reported
   * @param name CSS Variable name
   * @param value CSS Variable default value
   */
  private parseCssVariable(name: string, value = ''): CssVariable {
    const defaultValue = value.trim();
    const res = defaultValue.match(/^var\( *([^,)]*) *(?:, *([^,()]*(\(.*\))?))*\)$/);
    const ret: CssVariable = { name, defaultValue };
    if (!res) {
      let findRef = defaultValue;
      let ref: RegExpExecArray | null;
      const references: Record<string, CssVariable> = {};
      do {
        ref = /var\( *([^,)]*) *(?:, *([^,()]*(\(.*\))?))*\)/.exec(findRef);
        if (ref) {
          const refName = ref[1].replace(/^--/, '');
          references[refName] = this.parseCssVariable(refName, ref[2]);
          findRef = findRef.replace(ref[0], '');
        }
      } while (ref);
      if (Object.keys(references).length) {
        ret.references = Object.values(references);
      }
    } else {
      ret.references = [
        this.parseCssVariable(res[1].replace(/^--/, ''), res[2])
      ];
    }
    return ret;
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
    return color.alpha ? `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})` : `rgb(${color.red}, ${color.green}, ${color.blue}})`;
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

  private static extractTags(tags: Value) {
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
    }
    return contextTags;
  }

  /**
   * Extract metadata from Sass file
   * @param sassFilePath SCSS file to parse
   */
  public extractFile(sassFilePath: string): CssVariable[] {
    const cssVariables: CssVariable[] = [];
    const sassFileContent = fs.readFileSync(sassFilePath, {encoding: 'utf-8'});

    const options = {
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
          const packagePath = path.dirname(require.resolve(`${moduleName}/package.json`));
          const computedPathUrl = path.join(packagePath, cleanedUrl.replace(moduleName, ''));
          const fileUrl = pathToFileURL(computedPathUrl);
          this.cache[url] = fileUrl;
          return fileUrl;
        }
      }],
      functions: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'metadata-report($name, $value, $details: null)': (args: Value[]) => {
          let contextTags: string[] | undefined;
          const varName = args[0];
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
          if (!(varName instanceof SassString)) {
            throw new O3rCliError('invalid variable name');
          }

          let parsedValue: string;
          if (varValue instanceof SassString || varValue instanceof SassNumber || varValue instanceof SassBoolean) {
            parsedValue = varValue.toString();
          } else if (varValue instanceof SassColor) {
            parsedValue = CssVariableExtractor.getColorString(varValue);
          } else if (varValue instanceof SassList) {
            const invalidIndexes: number[] = [];
            const parsedValueItems: string[] = [];
            for (let i = 0; i < varValue.asList.size; i++) {
              const item = varValue.get(i);
              if (item instanceof SassString || item instanceof SassNumber || item instanceof SassBoolean) {
                parsedValueItems.push(item.toString());
              } else if (item instanceof SassColor) {
                parsedValueItems.push(CssVariableExtractor.getColorString(item));
              } else if (CssVariableExtractor.isSassCalculation(item)) {
                parsedValueItems.push(`calc(${item.$arguments[0]})`);
              } else {
                invalidIndexes.push(i);
              }
            }
            parsedValue = parsedValueItems.join(' ');
            if (invalidIndexes.length) {
              console.warn(`invalid value in the list (indexes: ${invalidIndexes.join(', ')}) for variable ${varName.text}, it will be ignored`);
            }
          } else if (CssVariableExtractor.isSassCalculation(varValue)) {
            parsedValue = `calc(${varValue.$arguments[0]})`;
          } else {
            console.warn(`invalid value for variable ${varName.text}, it will be ignored`);
            return new SassString(`[METADATA:VARIABLE] ${varName.text} : invalid value`);
          }
          const cssVariableObj = this.parseCssVariable(varName.text, parsedValue);
          cssVariableObj.tags = contextTags;
          cssVariableObj.description = description;
          cssVariableObj.label = label;
          cssVariableObj.type = type || 'string';
          cssVariableObj.category = category;
          cssVariables.push(cssVariableObj);
          return new SassString(`[METADATA:VARIABLE] ${varName.text} : ${parsedValue}` + (contextTags ? ` (tags: ${contextTags.join(', ')})` : ''));
        }
      }
    };

    compileString(sassFileContent, options);
    return cssVariables;
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
      .map(({ styleFilePath }) => {
        const libConfig = JSON.parse(fs.readFileSync(styleFilePath!, 'utf8'));
        return libConfig as CssMetadata;
      })
      .reduce<CssMetadata>((acc, libMetadata) => {
        return Object.keys(libMetadata.variables)
          .filter((key) => !!acc.variables[key])
          .reduce((libAcc, libKey) => {
            libAcc.variables[libKey] = libMetadata.variables[libKey];
            return libAcc;
          }, acc);
      }, {...current});
  }
}
