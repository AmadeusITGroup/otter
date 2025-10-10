import {
  cwd,
} from 'node:process';
import {
  cleanOutputDirectory,
} from './file-system/cleaner.mjs';
import {
  getModelFilePath,
  writeModelFile,
} from './file-system/write-model.mjs';
import {
  downloadDependency,
  retrieveManifest,
  retrieveManifestAuth,
  type RetrieveManifestAuthOptions,
} from './public_api.mjs';
import {
  type DownloadDependencyModelsOptions,
} from './retrieve/retrieve-artifact.mjs';
import { writeGitIgnore } from './file-system/write-gitignore.mjs';
import { transform } from './transforms/transform.mjs';
import { type RetrieveManifestOptions } from './manifest/manifest.mjs';

export interface InstallDependenciesOptions extends DownloadDependencyModelsOptions, RetrieveManifestOptions, RetrieveManifestAuthOptions {
  /** Define if a the generation of `.gitignore` file should be skipped */
  skipGitIgnore?: boolean;
}

/**
 * Run the process to download and write dependency models
 * @param workingDirectory
 * @param options
 */
export const installDependencies = async (workingDirectory = cwd(), options?: InstallDependenciesOptions) => {
  const { logger = console } = options || {};
  const [manifest, manifestAuth] = await Promise.all([
    retrieveManifest(workingDirectory, logger, options),
    retrieveManifestAuth(workingDirectory, logger)
  ]);

  if (!manifest) {
    logger?.info(`No Manifest file discovered`);
    return process.exit(0);
  }

  await cleanOutputDirectory(manifest);

  const results = await Promise.allSettled(
    manifest.dependencies
      ?.flatMap((dependency) => downloadDependency(dependency, manifestAuth, options))
      .map(async (awaitedModel) => {
        const { model, content, url, dependency } = await awaitedModel;
        const modelPath = await getModelFilePath(manifest, dependency, model);
        return writeModelFile(modelPath, transform(content, { dependency, url, model, modelPath }));
      }) || []
  );
  if (!options?.skipGitIgnore) {
    await writeGitIgnore(manifest);
  }

  const errors = results.filter((promiseResult): promiseResult is PromiseRejectedResult => promiseResult.status === 'rejected');
  if (errors.length > 0) {
    logger?.error(`The process stopped and failed on ${errors.length}/${results.length} models(s)`)
    errors
      .forEach(({ reason }) => logger?.debug?.(reason));
    throw new Error('Uncompleted process');
  } else {
    logger?.info(`The process successfully install ${results.length} specification(s) in ${manifest.dependencyOutput}`)
  }
};
