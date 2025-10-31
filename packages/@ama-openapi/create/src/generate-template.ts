import {
  promises as fs,
} from 'node:fs';
import {
  dirname,
  resolve,
} from 'node:path';
import {
  DEFAULT_MANIFEST_FILENAMES,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup
} from '@ama-openapi/core';
import {
  renderFile,
} from 'ejs';
import {
  sync,
} from 'globby';

/**
 * Options for template generation
 */
export interface CreateOptions {
  /** Target directory */
  target: string;
  /** Path to external models */
  externalModelPath: string;
  /** Version of the generator */
  version: string;
  /** Name of the package/artifact */
  packageName: string;
}

const TEMPLATE_EXTENSION = '.template';

/**
 * Generate Template files
 * @param options
 */
export const generateTemplate = async (options: CreateOptions) => {
  const { generatorDependencies } = JSON.parse(
    await fs.readFile(resolve(__dirname, '..', 'package.json'), { encoding: 'utf8' })
  ) as { generatorDependencies: Record<string, string> };
  const templatesDirectory = resolve(__dirname, '..', 'templates');
  const regExpExtension = new RegExp(`\\${TEMPLATE_EXTENSION}$`);
  const exportedFiles: string[] = [
    'bundle',
    'models',
    ...DEFAULT_MANIFEST_FILENAMES
  ];
  const generatedCode = sync('**/*', { cwd: templatesDirectory, dot: true })
    .map(async (templatePath) => {
      const templatePathAbsolute = resolve(templatesDirectory, templatePath);
      const content = await renderFile(
        templatePathAbsolute,
        {
          ...options,
          exportedFiles,
          redoclyVersion: generatorDependencies['@redocly/openapi-core'],
          standardGitignoreNode: await (await fetch('https://www.toptal.com/developers/gitignore/api/node')).text()
        },
        { async: true }
      );
      return {
        templatePath,
        content
      };
    })
    .map(async (file) => {
      const { templatePath, content } = await file;
      const outputPath = resolve(options.target, templatePath.replace(regExpExtension, ''));
      try {
        await fs.mkdir(dirname(outputPath), { recursive: true });
      } catch {
        // ignore error if folder already exists
      }
      await fs.writeFile(outputPath, content, { encoding: 'utf8' });
    });

  return Promise.all(generatedCode);
};
