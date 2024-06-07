const { writeFile, mkdir, copyFile } = require('node:fs/promises');
const { join } = require('node:path');

/**
 * Create a package.json file to use for the specs publication
 * @param packageJsonFilePath
 */
const createPackageJsonForSpecs = async (packageJsonFilePath) => {
  const packageJsonContent =
  {
    name: "@showcase/petstore-specs",
    version: "0.0.0-placeholder",
    deprecated: "This package is intended for testing purposes only.",
    publishConfig: {
      access: "public"
    },
    exports: {
      "./package.json": {
        default: "./package.json"
      },
      "./openapi.yml": {
        default: "./openapi.yml"
      }
    }
  };
  await writeFile(packageJsonFilePath, JSON.stringify(packageJsonContent, null, 2));
};

/**
 * Create readme file to use for the specs publication
 * @param readmeFilePath
 */
const createReadme = async (readmeFilePath) => {
  const readmeContent =
  `
# Overview
> [!CAUTION]
> The package is containing the petstore specs. It is intended for testing purposes only.
`
  await writeFile(readmeFilePath, readmeContent);
};

/**
 * Create an npm package structure for the specifications package
 */
const prepareSpecsPackage = async () => {
  const specsPackageJsonDir = join(__dirname, '..', 'dist-specs');
  await mkdir(specsPackageJsonDir, {recursive: true});
  await createPackageJsonForSpecs(join(specsPackageJsonDir, 'package.json'));
  await copyFile(join(__dirname, '..', 'openapi.yml'), join(specsPackageJsonDir, 'openapi.yml'));
  await createReadme(join(specsPackageJsonDir, 'readme.md'))
}

void prepareSpecsPackage();


