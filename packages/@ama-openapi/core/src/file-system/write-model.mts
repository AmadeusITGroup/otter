import {
  promises as fs,
} from 'node:fs';
import {
  extname,
  resolve,
  join,
} from 'node:path';
import {
  isDependencyArtifact,
  isDependencyLink,
  type Dependency,
  type DependencyLink,
  type Manifest,
  type Model,
} from '../public_api.mjs';

/**
 * Get the folder where generate the linked specification according to its path
 * @param dependency
 * @returns
 */
const getDependencyLinkPath = (dependency: DependencyLink) => {
  const pathParts = [
    // repository name
    /\/([^\/]+)\/raw\//.exec(dependency.link)?.at(1) || ''
  ];

  const url = new URL(dependency.link);

  if (url.hostname.endsWith('github.com')) {
    const urlMatch = /refs\/heads\/([^/]+)\/(.+)$/.exec(url.pathname);
    pathParts.push(...(urlMatch?.at(2)?.split('/').slice(0, -1) || []));
  } else {
    const urlMatch = /raw\/reference\/(.+)$/.exec(url.pathname);
    pathParts.push(...(urlMatch?.at(1)?.split('/').slice(0, -1) || []));
  }

  return join(...pathParts);
};

/**
 * Create the dependency folder if not exists and return its path.
 * @param dependency
 * @param dependencyOutput
 * @returns
 */
const getDependencyPath = async (dependency: Dependency, dependencyOutput: string) => {
  const folderName = isDependencyArtifact(dependency) ? dependency.name || dependency.artifact : getDependencyLinkPath(dependency);
  dependencyOutput = resolve(dependencyOutput, folderName);
  try {
    await fs.mkdir(dependencyOutput, { recursive: true });
  } catch {
    // ignore folder creation failure because ca be due to existing one. If not the next command will fail.
  }
  return dependencyOutput;
};

const getFileName = (dependency: Dependency, model?: Model) => {
  if (isDependencyLink(dependency)) {
    return new URL(dependency.link).pathname.split('/').at(-1);
  } else if (model) {
    return `${model.name}${extname(model.source)}`;
  }
}

export const getModelFilePath = async (manifest: Manifest, dependency: Dependency, model?: Model) => {
  const dependencyPath = await getDependencyPath(dependency, manifest.dependencyOutput);
  const fileName = getFileName(dependency, model);

  if (!fileName) {
    throw new Error(`No file name found for the dependency ${dependency.name}:${model?.name}`);
  }
  return resolve(dependencyPath, fileName);
}

/**
 * Write the model file in the dependencies folder.
 * @param manifest
 * @param dependency
 * @param model
 * @param content
 */
export const writeModelFile = async (modelFilePath: string, content: string) => {
  return fs.writeFile(modelFilePath, content, { encoding: 'utf8' });
};
