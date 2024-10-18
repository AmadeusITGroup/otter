import * as fs from 'node:fs';
import {
  mkdir,
  readFile,
  rm,
  writeFile
} from 'node:fs/promises';
import {
  basename,
  dirname,
  join,
  posix,
  resolve
} from 'node:path';
import {
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import * as globby from 'globby';
import * as semver from 'semver';
import {
  AggregateMigrationScriptsSchema
} from './schema';
import {
  createBuilderWithMetricsIfInstalled,
  type MigrationFile
} from '@o3r/extractors';

const STEPS = [
  'Find all migration files',
  'Fetch migration files from libraries and aggregate the changes',
  'Write the output'
];

/** The content of the migration file plus the filename */
interface MigrationFileEntry<T = any> {
  fileName: string;
  migrationObject: MigrationFile<T>;
}

/** A map that defines for each library the history of versions defined in all the original migration scripts */
interface LibraryVersions {
  [libName: string]: { libVersion: string; appVersion: string }[];
}

/**
 * Get the content of all migration files matching a glob
 * @param glob
 */
const getMigrationFiles = async (glob: string | string[]): Promise<MigrationFileEntry[]> => {
  return await Promise.all((await globby(glob, { fs }))
    .map(async (fileName) => ({
      fileName,
      migrationObject: JSON.parse(await readFile(fileName, { encoding: 'utf8' }))
    }))
  );
};

/**
 * Check if the lib version is valid
 * @param libVersion
 */
const isValidLibVersion = (libVersion: Partial<LibraryVersions[string][number]>): libVersion is LibraryVersions[string][number] =>
  !!libVersion.libVersion && !!libVersion.appVersion;

/**
 * Get the history of versions for each library in chronological order
 * @param migrationFiles
 */
const getLibrariesVersions = (migrationFiles: MigrationFileEntry[]): LibraryVersions => {
  const libraries: LibraryVersions = {};
  for (const file of migrationFiles) {
    if (file.migrationObject.libraries) {
      for (const [lib, version] of Object.entries<string>(file.migrationObject.libraries)) {
        if (!libraries[lib]) {
          libraries[lib] = [];
        }
        const libVersion = {
          libVersion: semver.coerce(version)?.raw,
          appVersion: semver.coerce(file.migrationObject.version)?.raw
        };

        if (isValidLibVersion(libVersion) && !libraries[lib].some((e) => e.libVersion === libVersion.libVersion && e.appVersion === libVersion.appVersion)) {
          libraries[lib].push(libVersion);
        }
      }
    }
  }
  // Sort and dedupe versions
  Object.entries(libraries).forEach(([libName, libVersions]) => {
    libVersions.sort((a, b) => semver.compare(a.appVersion, b.appVersion));
    libraries[libName] = libVersions.filter((libVersion, index) =>
      index < 1 || libVersions[index - 1].libVersion !== libVersion.libVersion);
  });
  return libraries;
};

/**
 * Write the migration files on disk
 * @param migrationFiles
 * @param destinationPath
 */
const writeMigrationFiles = async (migrationFiles: MigrationFileEntry[], destinationPath: string) => {
  const outputDirectory = resolve(destinationPath);
  if (fs.existsSync(outputDirectory)) {
    await rm(outputDirectory, { recursive: true });
  }

  for (const file of migrationFiles) {
    const distFilePath = join(outputDirectory, basename(file.fileName));
    if (!fs.existsSync(dirname(distFilePath))) {
      await mkdir(dirname(distFilePath), { recursive: true });
    }
    await writeFile(distFilePath, JSON.stringify(file.migrationObject, null, 2) + '\n');
  }
};

/**
 * Aggregate the relevant changes from libraries into the original migration files
 * @param migrationFiles
 * @param librariesVersions
 * @param resolver
 */
const aggregateLibrariesChangesIntoMigrationFiles = async (migrationFiles: MigrationFileEntry[], librariesVersions: LibraryVersions, resolver: (lib: string) => string) => {
  for (const file of migrationFiles) {
    if (file.migrationObject.libraries) {
      const appVersion = semver.coerce(file.migrationObject.version)?.raw;
      for (const [lib, version] of Object.entries<string>(file.migrationObject.libraries)) {
        const libIndex = librariesVersions[lib].findIndex((l) => l.appVersion === appVersion);
        if (libIndex > 0) {
          const newLibVersion = semver.coerce(version)?.raw;
          const previousLibVersion = librariesVersions[lib][libIndex - 1].libVersion;
          if (previousLibVersion !== newLibVersion) {
            const libRange = new semver.Range(`>${previousLibVersion} <=${newLibVersion}`);
            const libPath = dirname(resolver(`${lib}/package.json`)).replace(/[/\\]/g, '/');
            if (!fs.existsSync(libPath)) {
              throw new Error(`Library ${lib} not found at ${libPath}`);
            }
            const libMigrationFiles = await getMigrationFiles(posix.join(libPath, 'migration-scripts', '**', '*.json'));
            libMigrationFiles.forEach((libMigrationFile) => {
              if (semver.satisfies(libMigrationFile.migrationObject.version, libRange)) {
                file.migrationObject.changes = [
                  ...file.migrationObject.changes ?? [],
                  ...libMigrationFile.migrationObject.changes ?? []
                ];
              }
            });
          }
        }
      }
    }
  }
};

export default createBuilder<AggregateMigrationScriptsSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();
  try {
    let stepNumber = 1;
    context.reportProgress(stepNumber, STEPS.length, STEPS[stepNumber - 1]);
    const migrationFiles = await getMigrationFiles(options.migrationDataPath);
    if (migrationFiles.length === 0) {
      context.logger.info(`No migration files found, skipping aggregation`);
      return {
        success: true
      };
    }

    stepNumber++;
    context.reportProgress(stepNumber, STEPS.length, STEPS[stepNumber - 1]);
    const libResolver = options.librariesDirectory ? (lib: string) => posix.join(options.librariesDirectory!, lib) : require.resolve.bind(require);
    const librariesVersions = getLibrariesVersions(migrationFiles);
    if (Object.keys(librariesVersions).length === 0) {
      return {
        success: true
      };
    }
    await aggregateLibrariesChangesIntoMigrationFiles(migrationFiles, librariesVersions, libResolver);

    stepNumber++;
    context.reportProgress(stepNumber, STEPS.length, STEPS[stepNumber - 1]);
    await writeMigrationFiles(migrationFiles, options.outputDirectory);

    context.logger.info(`Migration files written successfully`);

    return {
      success: true
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  }
}));
