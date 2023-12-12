import type { PackageJson } from 'type-fest';

/** Configuration  in a package.json to indication specification to this package */
export interface PackageConfiguration {
  /** List of ignored dependencies */
  ignore?: string[];
  /** Ignore the update of the package manager version */
  ignorePackageManager?: boolean;
  /** Determine if this package should be ignored */
  skipPackage?: boolean;
}

/** Package Json with Otter specific configuration */
export type PackageJsonWithOtterConfiguration = PackageJson & {
  /** Otter Specific configuration */
  otter?: {
    versionHarmonize?: PackageConfiguration;
  };
};

/** Information of an extracted dependency */
export interface DependencyInfo {
  /** Path to the package.json */
  path: string;
  /** Content of the package.json */
  packageJson: PackageJsonWithOtterConfiguration;
  /** Range of the dependency */
  range: string;
  /** Type of the dependency extracted */
  type: string;
  /** Name of the dependency */
  dependencyName: string;
}

/** Dependency to update */
export interface DependencyToUpdate extends DependencyInfo {
  /** Reason of the update */
  reason: string;
}

/** Option of the Version Harmonize CLI */
export interface Options {
  /**
   * Enforce to align the version of the dependencies with the latest range.
   * If not set, the version will be aligned with the latest range if the latest range is not intersected with the current range.
   * @default false
   */
  alignPeerDependencies: boolean;

  /**
   * Display debug logs
   * @default false
   */
  verbose: boolean;

  /**
   * List of dependency types to update, comma separated
   * @default ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies', 'generatorDependencies']
   */
  dependencyTypes: string[];

  /** Path to the private package.json of the monorepo */
  monorepo: string;

  /** List of patterns of files to which apply the new calculated version without implicating them in the version determination */
  applyTo: string[];
}
