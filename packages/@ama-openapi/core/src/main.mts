import {
  cwd,
} from 'node:process';
import {
  cleanOutputDirectory,
} from './file-system/cleaner.mjs';
import {
  writeModelFile,
} from './file-system/write-model.mjs';
import {
  maskModelContent,
} from './mask/apply-mask.mjs';
import {
  isDependencyLink,
  retrieveManifest,
  retrieveManifestAuth,
} from './public_api.mjs';
import {
  downloadDependencyModels,
  type DownloadDependencyModelsOptions,
} from './retrieve/retrieve-artifact.mjs';
import { writeGitIgnore } from './file-system/write-gitignore.mjs';

export interface InstallDependenciesOptions extends DownloadDependencyModelsOptions {
  /** Define if a .gitignore file should be generated */
  addGitIgnore?: boolean;
}

/**
 * Run the process to download and write dependency models
 * @param workingDirectory
 * @param options
 */
export const installDependencies = async (workingDirectory = cwd(), options?: InstallDependenciesOptions) => {
  const { logger } = options || {};
  const [manifest, manifestAuth] = await Promise.all([
    retrieveManifest(workingDirectory, logger),
    retrieveManifestAuth(workingDirectory, logger)
  ]);

  await cleanOutputDirectory(manifest);

  try {
    await Promise.all(
      manifest.dependencies
        ?.flatMap((dependency) => {
          const models = downloadDependencyModels(dependency, manifestAuth, options);
          return models.map(async (awaitedModel) => {
            const { model, content, url } = await awaitedModel;
            const maskedContent = maskModelContent(content, url, model?.mask || (isDependencyLink(dependency) ? dependency.mask : undefined));
            await writeModelFile(manifest, dependency, model, maskedContent);
          });
        }) || []
    );
    if (options?.addGitIgnore) {
      await writeGitIgnore(manifest);
    }
  } catch(e) {
    logger?.error(e);
    logger?.warn('Because of issue during the setup, the dependencies directory will be cleaner');
    await cleanOutputDirectory(manifest);
  }
};
