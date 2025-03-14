import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  editorConfigParse,
  editorConfigResolve,
} from './editor-config.helpers';

/**
 * Apply the rule of the editor-config to the file listed by the patterns
 * @param includeExtensions List of file extensions on which the editorconfig should apply (applied to every touched file per default)
 */
export const applyEditorConfig = (includeExtensions?: string[]): Rule => {
  return async (tree, context) => {
    if (!tree.exists('.editorconfig')) {
      context.logger.warn('No config found, the editor-config process will not be run');
      return tree;
    }

    const parsedConfig = await editorConfigParse(tree.readText('.editorconfig'));
    // istanbul ignore next -- code to handle Jest testing CJS requirement issue
    if (!parsedConfig) {
      context.logger.warn('tiny-editorconfig is not loaded correctly, the editorConfig linter process will be skipped.');
      return tree;
    }
    const configs = [parsedConfig];
    const extensionsRegExp = includeExtensions?.map((ext) => new RegExp(`\\.${ext.replace(/^\./, '')}$`));

    tree.actions
      .filter((action) => !extensionsRegExp || extensionsRegExp.some((reg) => reg.test(action.path)))
      .forEach(async ({ path }) => {
        const config = (await editorConfigResolve(configs, path))!;
        const initialContent = tree.readText(path);
        let content = initialContent;

        const endOfLine = config.endOfLine?.startsWith('cr') ? '\r\n' : '\n';
        if (config.trimTrailingWhitespace) {
          content = content.replaceAll(/[\s]+$/mg, '');
        }
        if (config.insertFinalNewline !== undefined && !content.endsWith(endOfLine)) {
          content = content + endOfLine;
        }
        if (config.endOfLine !== undefined) {
          content = content.replace(/\r?\n/g, endOfLine);
        }
        if (initialContent !== content) {
          context.logger.debug(`Update ${path} based on EditorConfig rules`);
          tree.overwrite(path, content);
        }
      });
  };
};
