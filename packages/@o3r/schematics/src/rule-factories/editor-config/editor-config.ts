import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  Config,
  ConfigWithOverrides,
} from 'tiny-editorconfig';

/**
 * Apply the rule of the editor-config to the file listed by the patterns
 * @param includeExtensions List of file extensions on which the editorconfig should apply (applied to every touched file per default)
 */
export const applyEditorConfig = (includeExtensions?: string[]): Rule => {
  return async (tree, context) => {
    const { parse, resolve } = await import('tiny-editorconfig').catch(() => {
      context.logger.warn('tiny-editorconfig is not loaded correctly, a simple implementation will be used');
      return {
        parse: (content: string): ConfigWithOverrides => {
          return {
            charset: content.match(/^charset *= *(.+)$/m)?.[1] as any,
            endOfLine: content.match(/^end_of_line *= *(.+)$/m)?.[1] as any,
            indentSize: content.match(/^indent_size *= *(.+)$/m)?.[1] as any,
            insertFinalNewline: content.match(/^insert_final_newline *= *(.+)$/m)?.[1] === 'true',
            trimTrailingWhitespace: content.match(/^trim_trailing_whitespace *= *(.+)$/m)?.[1] === 'true'
          };
        },
        resolve: (multiConfigs: ConfigWithOverrides[], _filePath: string): Config => {
          return multiConfigs.reduce((acc, config) => ({ ...acc, ...config }), {} as Config);
        }
      };
    });
    const configs = tree.exists('.editorconfig') && [parse(tree.readText('.editorconfig'))];

    if (!configs) {
      context.logger.warn('No config found, the editor-config process will not be run');
      return tree;
    }

    const extensionsRegExp = includeExtensions?.map((ext) => new RegExp(`\\.${ext.replace(/^\./, '')}$`));

    tree.actions
      .filter((action) => !extensionsRegExp || extensionsRegExp.some((reg) => reg.test(action.path)))
      .forEach(({ path }) => {
        const config = resolve(configs, path);
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
          content = content.replaceAll(/(?:\\[rn]|[\r\n]+)+/mg, endOfLine);
        }
        if (initialContent !== content) {
          context.logger.debug(`Update ${path} based on EditorConfig rules`);
          tree.overwrite(path, content);
        }
      });
  };
};
