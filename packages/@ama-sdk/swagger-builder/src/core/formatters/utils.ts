/**
 * Generate the minimum content of a package.json
 * @param artifactName Name of the artifact
 * @param spec Swagger spec
 */
export function generatePackageJson(artifactName: string, spec: any) {
  return {
    name: artifactName,
    version: (spec && spec.info && spec.info.version) || '1.0.0',
    description: (spec && spec.info && spec.info.title) || null,
    license: 'BSD-3-Clause'
  };
}
