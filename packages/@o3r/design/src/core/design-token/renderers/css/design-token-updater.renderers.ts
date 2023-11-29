import type { DesignContentFileUpdater } from '../design-token.renderer.interface';

const AUTO_GENERATED_START = '/* --- BEGIN THEME Auto-generated --- */';
const AUTO_GENERATED_END = '/* --- END THEME Auto-generated --- */';
const SANITIZE_TAG_INPUTS_REGEXP = /[.*+?^${}()|[\]\\]/g;

const generateVars = (variables: string[], startTag: string, endTag: string, addCssScope = false) =>
  `${addCssScope ? ':root {\n' : ''}${startTag}\n${variables.join('\n')}\n${endTag}${addCssScope ? '\n}' : ''}`;

interface CssStyleContentUpdaterOptions {
  /**
   * Opening tag marking the content edition part
   * @default {@see AUTO_GENERATED_START}
   */
  startTag?: string;

  /**
   * Closing tag marking the content edition part
   * @default {@see AUTO_GENERATED_END}
   */
  endTag?: string;
}

/**
 * Retrieve a Content Updater function for CSS generator
 * @param options
 */
export const getCssStyleContentUpdater = (options?: CssStyleContentUpdaterOptions): DesignContentFileUpdater => {
  const startTag = options?.startTag || AUTO_GENERATED_START;
  const endTag = options?.endTag || AUTO_GENERATED_END;

  /** Regexp to replace the content between the detected tags. It also handle possible inputted special character sanitization */
  const regexToReplace = new RegExp(`${startTag.replace(SANITIZE_TAG_INPUTS_REGEXP, '\\$&')}(:?(.|[\n\r])*)${endTag.replace(SANITIZE_TAG_INPUTS_REGEXP, '\\$&')}`);

  return (variables, _file, styleContent = '') => {
    if (styleContent.indexOf(startTag) >= 0 && styleContent.indexOf(endTag) >= 0) {
      return styleContent.replace(regexToReplace, generateVars(variables, startTag, endTag));
    } else {
      return styleContent + '\n' + generateVars(variables, startTag, endTag, true);
    }
  };
};
