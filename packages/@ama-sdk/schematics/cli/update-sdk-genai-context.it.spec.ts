/**
 * Test environment exported by O3rEnvironment, must be first line of the file
 * @jest-environment @o3r/test-helpers/jest-environment
 * @jest-environment-o3r-app-folder test-sdk-context
 * @jest-environment-o3r-type blank
 */
const o3rEnvironment = globalThis.o3rEnvironment;

import * as fs from 'node:fs';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  getDefaultExecSyncOptions,
  getPackageManager,
  getYarnVersionFromRoot,
  packageManagerCreate,
  packageManagerExec,
  packageManagerInstall,
} from '@o3r/test-helpers';
import type {
  PackageJson,
} from 'type-fest';

const sdkPackageName = '@my-test/sdk';
let sdkFolderPath: string;
let sdkPackagePath: string;
const execAppOptions = getDefaultExecSyncOptions();
const packageManager = getPackageManager();

describe('Update SDK context command', () => {
  beforeEach(() => {
    const isYarnTest = o3rEnvironment.testEnvironment.isYarnTest;
    const yarnVersion = isYarnTest ? getYarnVersionFromRoot(process.cwd()) || 'latest' : undefined;
    sdkFolderPath = o3rEnvironment.testEnvironment.workspacePath;
    sdkPackagePath = path.join(sdkFolderPath, sdkPackageName.replace(/^@/, ''));
    execAppOptions.cwd = sdkFolderPath;

    if (isYarnTest) {
      fs.writeFileSync(path.join(sdkFolderPath, 'package.json'), `{"name": "@test/sdk", "packageManager": "yarn@${yarnVersion}"}`);
      packageManagerInstall(execAppOptions);

      // copy yarnrc config to generated SDK
      mkdirSync(sdkPackagePath, { recursive: true });
      cpSync(path.join(sdkFolderPath, '.yarnrc.yml'), path.join(sdkPackagePath, '.yarnrc.yml'));
      cpSync(path.join(sdkFolderPath, '.yarn'), path.join(sdkPackagePath, '.yarn'), { recursive: true });
      fs.writeFileSync(path.join(sdkPackagePath, 'yarn.lock'), '');
    } else {
      // copy npmrc config to generated SDK
      mkdirSync(sdkPackagePath, { recursive: true });
      cpSync(path.join(sdkFolderPath, '.npmrc'), path.join(sdkPackagePath, '.npmrc'));
    }

    // Copy mock OpenAPI spec
    cpSync(path.join(__dirname, '..', 'testing', 'mocks', 'MOCK_openapi_petstore.yaml'), path.join(sdkFolderPath, 'open-api.yaml'));

    // Create the SDK once for all tests
    packageManagerCreate({
      script: '@ama-sdk',
      args: ['typescript', sdkPackageName, '--package-manager', packageManager, '--spec-path', path.join(sdkFolderPath, 'open-api.yaml')]
    },
    execAppOptions);
  });

  test('should generate SDK_CONTEXT.md with domains from OpenAPI spec', () => {
    // Run the update-sdk-context script
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: []
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Verify SDK_CONTEXT.md was generated
    const sdkContextPath = path.join(sdkPackagePath, 'SDK_CONTEXT.md');
    expect(existsSync(sdkContextPath)).toBe(true);

    const sdkContextContent = readFileSync(sdkContextPath, 'utf8');
    expect(sdkContextContent).toContain('### pet');
    expect(sdkContextContent).toContain('### store');
    expect(sdkContextContent).toContain('### user');
    expect(sdkContextContent).toContain('Order');
    expect(sdkContextContent).toContain('User');
  });

  test('should use custom domain descriptions when provided', () => {
    // Create custom domain descriptions file
    const customDescriptions = {
      pet: 'Custom description for pet domain',
      store: 'Custom description for store domain'
    };
    const descriptionsPath = path.join(sdkPackagePath, 'domain-descriptions.json');
    fs.writeFileSync(descriptionsPath, JSON.stringify(customDescriptions, null, 2));

    // Run the update-sdk-context script with custom descriptions
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--domain-descriptions', 'domain-descriptions.json']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Verify SDK_CONTEXT.md contains custom descriptions
    const sdkContextPath = path.join(sdkPackagePath, 'SDK_CONTEXT.md');
    const sdkContextContent = readFileSync(sdkContextPath, 'utf8');

    expect(sdkContextContent).toContain('Custom description for pet domain');
    expect(sdkContextContent).toContain('Custom description for store domain');
    // user domain should fallback to OpenAPI tag description
    expect(sdkContextContent).toContain('Operations about user');
  });

  test('should use custom spec path when provided', () => {
    // Copy the OpenAPI spec to a custom location
    const customSpecDir = path.join(sdkPackagePath, 'specs');
    mkdirSync(customSpecDir, { recursive: true });
    cpSync(path.join(sdkFolderPath, 'open-api.yaml'), path.join(customSpecDir, 'my-api.yaml'));

    // Run the update-sdk-context script with custom spec path
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--spec-path', 'specs/my-api.yaml']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Verify SDK_CONTEXT.md was generated (no need to re-check domains since that's covered in first test)
    const sdkContextPath = path.join(sdkPackagePath, 'SDK_CONTEXT.md');
    expect(existsSync(sdkContextPath)).toBe(true);
  });

  test('should add prepare:context script when --prepare-script flag is used', () => {
    // Run the update-sdk-context script with --prepare-script flag
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--prepare-script']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Read the updated package.json
    const packageJsonPath = path.join(sdkPackagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;

    // Verify the prepare:context script was added
    expect(packageJson.scripts['prepare:context']).toBe('cpy SDK_CONTEXT.md dist/');

    // Verify cpy-cli was added as dev dependency
    expect(packageJson.devDependencies['cpy-cli']).toBeDefined();
    expect(packageJson.devDependencies['cpy-cli']).toMatch(/^[~^]?\d+\.\d+\.\d+$/);

    // Verify the build script was updated to include prepare:context
    expect(packageJson.scripts.build).toContain('npm run prepare:context');
  });

  test('should not modify existing prepare:context script', () => {
    // Add existing prepare:context script to package.json
    const packageJsonPath = path.join(sdkPackagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;
    packageJson.scripts['prepare:context'] = 'echo "existing script"';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Run the update-sdk-context script with --prepare-script flag
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--prepare-script']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Read the updated package.json
    const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;

    // Verify the existing script was not changed
    expect(updatedPackageJson.scripts?.['prepare:context']).toBe('echo "existing script"');
  });

  test('should not install cpy-cli when already present', () => {
    // Ensure cpy-cli is already in devDependencies
    const packageJsonPath = path.join(sdkPackagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;
    packageJson.devDependencies ||= {};
    packageJson.devDependencies['cpy-cli'] = '^6.0.0';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Run the update-sdk-context script with --prepare-script flag
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--prepare-script']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Read the updated package.json
    const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson;

    // Verify cpy-cli version remained unchanged
    expect(updatedPackageJson.devDependencies?.['cpy-cli']).toBe('^6.0.0');

    // Verify the prepare:context script was added
    expect(updatedPackageJson.scripts['prepare:context']).toBe('cpy SDK_CONTEXT.md dist/');
  });

  test('should use --sdk-path flag to specify custom SDK path', () => {
    // Create a custom SDK directory
    const customSdkPath = path.join(sdkFolderPath, 'custom-sdk');
    mkdirSync(customSdkPath, { recursive: true });

    // Create package.json in custom SDK directory
    const customPackageJson = {
      name: 'custom-sdk',
      version: '1.0.0',
      scripts: {
        build: 'tsc'
      }
    };
    fs.writeFileSync(path.join(customSdkPath, 'package.json'), JSON.stringify(customPackageJson, null, 2));

    // Copy the OpenAPI spec to custom SDK directory
    const specSourcePath = path.join(sdkFolderPath, 'open-api.yaml');
    const specDestPath = path.join(customSdkPath, 'open-api.yaml');
    cpSync(specSourcePath, specDestPath);

    // Run the update-sdk-context script with --sdk-path flag from the SDK directory
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--sdk-path', customSdkPath]
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Verify SDK_CONTEXT.md was created in the custom SDK directory
    const sdkContextPath = path.join(customSdkPath, 'SDK_CONTEXT.md');
    expect(existsSync(sdkContextPath)).toBe(true);
  });

  test('should handle missing package.json gracefully when using --prepare-script', () => {
    // Create a directory without package.json
    const emptySdkPath = path.join(sdkFolderPath, 'empty-sdk');
    mkdirSync(emptySdkPath, { recursive: true });

    // Copy the OpenAPI spec to the empty SDK directory
    cpSync(path.join(sdkFolderPath, 'open-api.yaml'), path.join(emptySdkPath, 'open-api.yaml'));

    // Run the update-sdk-context script with --prepare-script flag from the SDK directory
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--prepare-script', '--sdk-path', emptySdkPath]
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();
  });

  test('should fail with helpful error when OpenAPI spec is not found', () => {
    // Run the update-sdk-context script with a non-existent spec file - should fail
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--spec-path', 'non-existent-spec.yaml']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).toThrow();
  });

  test('should preserve user edits outside DOMAINS section when --preserve-edits is used', () => {
    // First, generate the initial SDK_CONTEXT.md
    packageManagerExec({
      script: 'amasdk-update-sdk-context',
      args: []
    }, { ...execAppOptions, cwd: sdkPackagePath });

    // Read the generated file and add custom content
    const sdkContextPath = path.join(sdkPackagePath, 'SDK_CONTEXT.md');
    let sdkContextContent = readFileSync(sdkContextPath, 'utf8');

    // Add custom header content before DOMAINS-START
    sdkContextContent = sdkContextContent.replace(
      '<!-- DOMAINS-START -->',
      '## My Custom Header Section\n\nThis is custom content that should be preserved.\n\n<!-- DOMAINS-START -->'
    );

    // Add custom footer content after DOMAINS-END
    sdkContextContent = sdkContextContent.replace(
      '<!-- DOMAINS-END -->',
      '<!-- DOMAINS-END -->\n\n## My Custom Footer Section\n\nThis footer content should also be preserved.'
    );

    fs.writeFileSync(sdkContextPath, sdkContextContent);

    // Re-run the update-sdk-context script with --preserve-edits flag
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--preserve-edits']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Verify the custom content was preserved
    const updatedContent = readFileSync(sdkContextPath, 'utf8');
    expect(updatedContent).toContain('## My Custom Header Section');
    expect(updatedContent).toContain('This is custom content that should be preserved.');
    expect(updatedContent).toContain('## My Custom Footer Section');
    expect(updatedContent).toContain('This footer content should also be preserved.');

    // Verify the domains section was still regenerated (contains expected domains)
    expect(updatedContent).toContain('### pet');
    expect(updatedContent).toContain('### store');
    expect(updatedContent).toContain('### user');
  });

  test('should regenerate full file without --preserve-edits even if file exists', () => {
    // First, generate the initial SDK_CONTEXT.md
    packageManagerExec({
      script: 'amasdk-update-sdk-context',
      args: []
    }, { ...execAppOptions, cwd: sdkPackagePath });

    // Read the generated file and add custom content
    const sdkContextPath = path.join(sdkPackagePath, 'SDK_CONTEXT.md');
    let sdkContextContent = readFileSync(sdkContextPath, 'utf8');

    // Add custom header content
    sdkContextContent = sdkContextContent.replace(
      '<!-- DOMAINS-START -->',
      '## Custom Content To Be Overwritten\n\n<!-- DOMAINS-START -->'
    );
    fs.writeFileSync(sdkContextPath, sdkContextContent);

    // Re-run WITHOUT --preserve-edits flag
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: []
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Verify the custom content was NOT preserved (file was regenerated)
    const updatedContent = readFileSync(sdkContextPath, 'utf8');
    expect(updatedContent).not.toContain('## Custom Content To Be Overwritten');

    // Verify standard content is present
    expect(updatedContent).toContain('### pet');
  });

  test('should preserve disambiguation notes when --preserve-edits is used', () => {
    // First, generate the initial SDK_CONTEXT.md
    packageManagerExec({
      script: 'amasdk-update-sdk-context',
      args: []
    }, { ...execAppOptions, cwd: sdkPackagePath });

    // Read the generated file and add disambiguation notes
    const sdkContextPath = path.join(sdkPackagePath, 'SDK_CONTEXT.md');
    let sdkContextContent = readFileSync(sdkContextPath, 'utf8');

    // Add disambiguation notes in the expected section
    sdkContextContent = sdkContextContent.replace(
      '<!-- Add project-specific clarifications below -->',
      '<!-- Add project-specific clarifications below -->\nMy custom disambiguation note: Use pet domain for all animal-related operations.'
    );
    fs.writeFileSync(sdkContextPath, sdkContextContent);

    // Re-run with --preserve-edits flag
    expect(() =>
      packageManagerExec({
        script: 'amasdk-update-sdk-context',
        args: ['--preserve-edits']
      }, { ...execAppOptions, cwd: sdkPackagePath })
    ).not.toThrow();

    // Verify disambiguation notes were preserved
    const updatedContent = readFileSync(sdkContextPath, 'utf8');
    expect(updatedContent).toContain('My custom disambiguation note: Use pet domain for all animal-related operations.');
  });
});
