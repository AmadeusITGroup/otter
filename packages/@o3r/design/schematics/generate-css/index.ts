import type { GenerateCssSchematicsSchema } from './schema';
import type { Rule } from '@angular-devkit/schematics';
import { parseDesignTokenFile, renderDesignTokens } from '@o3r/design';
import type { DesignTokenRendererOptions, DesignTokenVariableSet, DesignTokenVariableStructure } from '@o3r/design';

/* for v9.6 migration only, it is integrated into @o3r/schematics package in v10 */
import { getAllFilesInTree } from '@o3r/schematics';
import type { Tree } from '@angular-devkit/schematics';
import { minimatch } from 'minimatch';
function globInTree(tree: Tree, patterns: string[]): string[] {
  const files = getAllFilesInTree(tree);
  return files.filter((basePath) => patterns.some((p) => minimatch(basePath, p, { dot: true })));
}

/**
 * Generate CSS from Design Token files
 * @param options
 */
export function generateCss(options: GenerateCssSchematicsSchema): Rule {
  return async (tree, context) => {
    const writeFile = (filePath: string, content: string) => tree.exists(filePath) ? tree.overwrite(filePath, content) : tree.create(filePath, content);
    const readFile = tree.readText;
    const existsFile = tree.exists;
    const determineFileToUpdate = options.output ? () => options.output! :
      (token: DesignTokenVariableStructure) => {
        if (token.extensions.o3rTargetFile && tree.exists(token.extensions.o3rTargetFile)) {
          return token.extensions.o3rTargetFile;
        }

        return options.defaultStyleFile;
      };
    const renderDesignTokenOptions: DesignTokenRendererOptions = {
      readFile,
      writeFile,
      existsFile,
      determineFileToUpdate,
      logger: context.logger
    };

    const files = globInTree(tree, Array.isArray(options.designTokenFilePatterns) ? options.designTokenFilePatterns : [options.designTokenFilePatterns]);

    const duplicatedToken: DesignTokenVariableStructure[] = [];
    const tokens = (await Promise.all(files.map(async (file) => ({ file, parsed: await parseDesignTokenFile(file) }))))
      .reduce<DesignTokenVariableSet>((acc, { file, parsed }) => {
        parsed.forEach((variable, key) => {
          if (acc.has(key)) {
            context.logger[options.failOnDuplicate ? 'error' : 'warn'](`A duplication of the variable ${key} is found in ${file}`);
          }
          acc.set(key, variable);
        });
        return acc;
      }, new Map());
    if (options.failOnDuplicate && duplicatedToken.length > 0) {
      throw new Error(`Found ${duplicatedToken.length} duplicated Design Token keys`);
    }
    await renderDesignTokens(tokens, renderDesignTokenOptions);
  };
}
