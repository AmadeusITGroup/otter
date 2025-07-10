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
   * Version number to apply to the packge
   * @default '0.0.0-placeholder'
   */
  version?: string;
}

/**
 * Generate the NPM package.json content file
 * @param options
 */
export const generatePackage = (options: GeneratePackageOptions): PackageJson | Promise<PackageJson> => {
  return {
    name: options.name?.replaceAll(' ', '-').toLowerCase(),
    version: options.version || '0.0.0-placeholder',
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
