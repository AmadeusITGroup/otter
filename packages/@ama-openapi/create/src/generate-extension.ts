import {
  readFile,
  writeFile,
} from 'node:fs/promises';
import {
  resolve,
} from 'node:path';
import {
  OUTPUT_DIRECTORY,
  // eslint-disable-next-line import/no-unresolved -- Cannot resolve mjs file in current setup (see #3738)
} from '@ama-openapi/core';
import {
  type CreateOptions,
  generateTemplate,
} from './generate-template';

/**
 * Generate extension project
 * @param target
 * @param packageName
 * @param version
 * @param dependencyBaseSpec
 */
export const generateExtension = async (target: string, packageName: string, version: string, dependencyBaseSpec?: string) => {
  const options = {
    target,
    externalModelPath: OUTPUT_DIRECTORY,
    version,
    dependencyBaseSpec,
    packageName,
    logger: console
  } as const satisfies Partial<CreateOptions>;
  await generateTemplate({ ...options, templateDirectory: 'design' });
  await generateTemplate({ ...options, templateDirectory: 'design-extension' });

  const scripts = {
    build: 'redocly bundle && npm run build:merge',
    'build:base': 'redocly bundle base',
    'build:extension': 'redocly bundle server',
    'build:merge': 'redocly bundle filter-client && redocly join filtered-client server -o ./bundle/specification.yaml',
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
