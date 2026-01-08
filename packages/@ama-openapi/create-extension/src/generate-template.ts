import {
  readFile,
  writeFile,
} from 'node:fs/promises';
import {
  resolve,
} from 'node:path';
import {
  type CreateOptions,
  generateTemplate,
} from '@ama-openapi/create';

/** Options interface to create extension */
export interface CreateExtensionOptions extends CreateOptions {
  /** Name of the NPM artifact to use as the dependency base specification (e.g. @my-org/specification) */
  dependencyBaseSpec?: string;
}

/**
 * Edit package.json file after generation
 * @param options
 */
const editPackageJson = async (options: CreateExtensionOptions) => {
  const { target } = options;
  const scripts = {
    build: 'redocly bundle && npm run build:merge',
    'build:base': 'redocly bundle base',
    'build:extension': 'redocly bundle server',
    'build:merge': 'redocly bundle filter-base && redocly join filtered-base server -o ./bundle/specification.yaml',
    'retrieve-externals': 'ama-openapi install',
    'watch:retrieve-externals': 'ama-openapi watch',
    postinstall: 'ama-openapi install'
  };

  const packageJsonPath = resolve(target, 'package.json');
  return writeFile(
    packageJsonPath,
    JSON.stringify(
      {
        ...JSON.parse(await readFile(packageJsonPath, { encoding: 'utf8' })),
        ...scripts
      },
      null,
      2
    )
  );
};

const editGitIgnore = async (options: CreateExtensionOptions) => {
  const { target } = options;
  return writeFile(
    resolve(target, '.gitignore'),
    await readFile(resolve(__dirname, '..', '.gitignore'), { encoding: 'utf8' })
    + `\n# temporary files`
    + `\n/tmp`
  );
};

/**
 * Generate extension project
 * @param options
 */
export const generateExtension = async (options: CreateExtensionOptions) => {
  await generateTemplate({ ...options });
  await generateTemplate({ ...options, templatesDirectory: resolve(__dirname, '..', 'templates') });
  await editPackageJson(options);
  await editGitIgnore(options);
};
