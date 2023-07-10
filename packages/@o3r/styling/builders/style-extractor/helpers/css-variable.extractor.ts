import { getLibraryCmsMetadata } from '@o3r/extractors';
import type { CssMetadata, CssVariable } from '@o3r/styling';
import * as fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import * as path from 'node:path';
import {
  compileString,
  SassBoolean,
  SassColor,
  SassList,
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
   *
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
   *
   * @param value
   */
  private static isSassCalculation(value: Value | undefined): value is SassCalculation {
    return !!value && (value as any).name === 'calc';
  }

  /**
   * Get CSS String for given color
   *
   * @param color Sass Color
   */
  private static getColorString(color: SassColor) {
    return color.alpha ? `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})` : `rgb(${color.red}, ${color.green}, ${color.blue}})`;
  }

  /**
   * Returns the package name from an url
   *
   * @param url
   */
  private static getPackageName(url: string): string {
    if (url.startsWith('bootstrap')) {
      return 'bootstrap';
    }
    return url.split('/').slice(0, 2).join('/');
  }

  /**
   * Extract metadata from Sass file
   *
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
        'metadata-report($name, $value, $tags: null)': (args: Value[]) => {
          let contextTags: string[] | undefined;
          const name = args[0];
          const value = args[1];
          const tags = args[2];
          if (tags) {
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
          }
          if (!(name instanceof SassString)) {
            throw new Error('invalid variable name');
          }

          let parsedValue: string;
          if (value instanceof SassString || value instanceof SassNumber || value instanceof SassBoolean) {
            parsedValue = value.toString();
          } else if (value instanceof SassColor) {
            parsedValue = CssVariableExtractor.getColorString(value);
          } else if (value instanceof SassList) {
            const invalidIndexes: number[] = [];
            const parsedValueItems: string[] = [];
            for (let i = 0; i < value.asList.size; i++) {
              const item = value.get(i);
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
              console.warn(`invalid value in the list (indexes: ${invalidIndexes.join(', ')}) for variable ${name.text}, it will be ignored`);
            }
          } else if (CssVariableExtractor.isSassCalculation(value)) {
            parsedValue = `calc(${value.$arguments[0]})`;
          } else {
            console.warn(`invalid value for variable ${name.text}, it will be ignored`);
            return new SassString(`[METADATA:VARIABLE] ${name.text} : invalid value`);
          }
          const cssVariableObj = this.parseCssVariable(name.text, parsedValue);
          cssVariableObj.tags = contextTags;
          if (cssVariableObj) {
            cssVariables.push(cssVariableObj);
          }
          return new SassString(`[METADATA:VARIABLE] ${name.text} : ${parsedValue}` + (contextTags ? ` (tags: ${contextTags.join(', ')})` : ''));
        }
      }
    };

    compileString(sassFileContent, options);
    return cssVariables;
  }

  /**
   * Extract metadata
   *
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
