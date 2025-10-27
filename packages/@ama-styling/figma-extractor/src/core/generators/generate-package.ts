import {
  readFile,
} from 'node:fs/promises';
import {
  resolve,
} from 'node:path';
import {
  PackageJson,
} from 'type-fest';

/** Package.json generation option */
export interface GeneratePackageOptions {
  /** Name of the manifest.json file to target */
  manifestFile: string;
  /** Name of the NPM package */
  name: string;
  /**
   * Version number to apply to the package
   * @default '0.0.0-placeholder'
   */
  version?: string;
}

/**
 * Generate the NPM package.json content file
 * @param options
 */
export const generatePackage = async (options: GeneratePackageOptions): Promise<PackageJson> => {
  const ownPackage = JSON.parse(await readFile(resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson & { generatorDependencies?: Record<string, string> };
  return {
    name: options.name?.replaceAll(' ', '-').toLowerCase(),
    version: options.version || '0.0.0-placeholder',
    preferUnplugged: true,
    peerDependencies: {
      '@ama-styling/style-dictionary': ownPackage.generatorDependencies?.['@ama-styling/style-dictionary']!,
      'style-dictionary': ownPackage.generatorDependencies?.['style-dictionary']!
    },
    peerDependenciesMeta: {
      '@ama-styling/style-dictionary': {
        optional: true
      },
      'style-dictionary': {
        optional: true
      }
    },
    exports: {
      '.': {
        default: `./${options.manifestFile}`
      },
      './package.json': {
        default: './package.json'
      },
      './*.json': {
        default: './*.json'
      }
    }
  };
};
