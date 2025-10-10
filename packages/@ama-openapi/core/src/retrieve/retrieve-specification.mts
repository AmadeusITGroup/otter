import { downloadDependencyModels, isDependencyArtifact, type Dependency, type ManifestAuth, type Model } from "../public_api.mjs";
import type { DownloadDependencyModelsOptions } from "./retrieve-artifact.mjs";
import { downloadDependencyLink, DownloadDependencyLinkOptions } from "./retrieve-link.mjs";

interface RetrievedDependency {
  url: string;
  content: string;
  dependency: Dependency;
  model?: Model;
}

/**
 * Download models from the dependency artifact
 * @param dependency
 * @param manifestAuth
 * @param options
 * @returns
 */
export const downloadDependency = (dependency: Dependency, manifestAuth: ManifestAuth, options?: DownloadDependencyModelsOptions & DownloadDependencyLinkOptions): Promise<RetrievedDependency>[] => {
  if (isDependencyArtifact(dependency)) {
    return downloadDependencyModels(dependency, manifestAuth, options);
  } else {
    return downloadDependencyLink(dependency, manifestAuth, options)
  }
};
