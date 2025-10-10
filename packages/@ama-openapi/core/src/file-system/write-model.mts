import {
  promises as fs,
} from 'node:fs';
import {
  extname,
  resolve,
} from 'node:path';
import {
  type Dependency,
  type DependencyArtifact,
  type Manifest,
  type Model,
} from '../public_api.mjs';

/**
 * Create the dependency folder if not exists and return its path.
 * @param dependency
 * @param dependencyOutput
 * @returns
 */
const getDependencyPath = async (dependency: Dependency, dependencyOutput: string) => {
  dependencyOutput = resolve(dependencyOutput, dependency.name || (dependency as DependencyArtifact).artifact);
  try {
    await fs.mkdir(dependencyOutput, { recursive: true });
  } catch {
    // ignore folder creation failure because ca be due to existing one. If not the next command will fail.
  }
  return dependencyOutput;
};

/**
 * Write the model file in the dependencies folder.
 * @param manifest
 * @param dependency
 * @param model
 * @param content
 */
export const writeModelFile = async (manifest: Manifest, dependency: Dependency, model: Model | undefined, content: string) => {
  const dependencyPath = await getDependencyPath(dependency, manifest.dependencyOutput);
  const modelFilePath = model ? resolve(dependencyPath, `${model.name}${extname(model.source)}`) : dependencyPath;
  await fs.writeFile(modelFilePath, content, { encoding: 'utf8' });
};
