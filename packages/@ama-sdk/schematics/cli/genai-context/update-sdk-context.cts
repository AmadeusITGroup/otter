import {
  execFileSync,
} from 'node:child_process';
import {
  existsSync,
  promises as fs,
  readFileSync,
} from 'node:fs';
import {
  basename,
  dirname,
  join,
  resolve,
} from 'node:path';
import {
  createInterface,
} from 'node:readline';
import {
  strings,
} from '@angular-devkit/core';
import {
  getPackageManager,
} from '@o3r/schematics';
import {
  load,
} from 'js-yaml';
import type {
  PackageJson,
} from 'type-fest';
import {
  type Domain,
  extractDomains,
  type OpenAPISpec,
} from './update-sdk-context.helpers';
import {
  renderSdkContextTemplate,
} from './update-sdk-context.template';

/** Logger interface */
export type Logger = {
  log: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  info: (message: string) => void;
  debug: (message: string) => void;
};

const DOMAIN_DESCRIPTIONS_FILENAME = 'domain-descriptions.json';

/**
 * Load OpenAPI specifications from file or default locations
 * @param projectPath Path to the OpenAPI specification file
 * @param specFileName Name of the OpenAPI specification file
 * @returns OpenAPI specification as JSON object
 */
function loadOpenAPISpec(projectPath: string, specFileName: string | undefined): OpenAPISpec {
  let isYaml = false;
  let specPath: string;
  if (specFileName) {
    specPath = resolve(projectPath, specFileName);
    if (!existsSync(specPath)) {
      throw new Error(`OpenAPI specification not found at: ${specPath}`);
    }
    isYaml = specPath.endsWith('.yaml') || specPath.endsWith('.yml');
  } else {
    const yamlPath = join(projectPath, 'open-api.yaml');
    const jsonPath = join(projectPath, 'open-api.json');

    if (existsSync(yamlPath)) {
      specPath = yamlPath;
      isYaml = true;
    } else if (existsSync(jsonPath)) {
      specPath = jsonPath;
    } else {
      throw new Error(`No OpenAPI specification found. Looked for:\n  - ${yamlPath}\n  - ${jsonPath}`);
    }
  }

  const specContent = readFileSync(specPath, 'utf8');

  try {
    return (isYaml ? load(specContent) : JSON.parse(specContent)) as OpenAPISpec;
  } catch (error) {
    throw new Error(`Failed to parse OpenAPI specification at ${specPath}: ${(error as Error).message}`);
  }
}

/**
 * Read the domain descriptions from user file, this allow for custom domain descriptions
 * and extra clarifications
 * @param filePath Path to the domain descriptions file
 */
function loadDomainDescriptions(filePath: string): Record<string, string> | null {
  if (!existsSync(filePath)) {
    throw new Error(`Domain descriptions file not found: ${filePath}`);
  }

  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, string>;
  } catch {
    throw new Error(`Failed to parse domain descriptions file: ${filePath}`);
  }
}

/**
 * Read the package.json file
 * @param projectPath Path to the project root
 */
function loadPackageJson(projectPath: string): PackageJson {
  const packagePath = join(projectPath, 'package.json');
  if (existsSync(packagePath)) {
    return JSON.parse(readFileSync(packagePath, 'utf8')) as PackageJson;
  }
  return {};
}

/**
 * Read the existing disambiguation notes from SDK_CONTEXT.md
 * @param projectPath Path to the project root
 */
function loadExistingDisambiguation(projectPath: string): string {
  const contextPath = join(projectPath, 'SDK_CONTEXT.md');
  if (existsSync(contextPath)) {
    const content = readFileSync(contextPath, 'utf8');
    const match = content.match(/## User Disambiguation Notes\s*\n<!-- Add project-specific clarifications below -->\n([\s\S]*?)(?=\n---|\n##|$)/);
    return match ? match[1].trim() : '';
  }
  return '';
}

/**
 * Generate the SDK_CONTEXT.md file
 * @param spec OpenAPI specification as JSON object
 * @param domains Map of domains
 * @param packageName Package name
 * @param disambiguation Disambiguation notes
 */
async function generateContextFile(
  spec: OpenAPISpec,
  domains: Map<string, Domain>,
  packageName: string,
  disambiguation: string
): Promise<string> {
  const openApiVersion = 'openapi' in spec ? spec.openapi : ('swagger' in spec ? spec.swagger : 'unknown');
  const apiTitle = spec.info?.title || 'Unknown API';
  let domainsSection = '';
  domains.forEach((domain) => {
    domainsSection += `
### ${domain.name}

**What this domain is about**: ${domain.description}

**API Class**: \`src/api/${domain.name}/${domain.name}-api.ts\`

**Available Operations:**

| Operation ID | Method | Description |
|--------------|--------|-------------|
`;
    domain.operations.forEach((op) => {
      domainsSection += `| \`${op.operationId}\` | ${op.method} | ${op.summary} |\n`;
    });
    domainsSection += `\n**Models used in this domain:**\n`;
    if (domain.models.size > 0) {
      domain.models.forEach((model) => {
        domainsSection += `- \`${model}\` - imported from \`src/models/base/${strings.dasherize(model)}/\`\n`;
      });
    } else {
      domainsSection += `- (none)\n`;
    }
    domainsSection += '\n';
  });

  const domainTree = Array.from(domains.values())
    .map((d) => `│   ├── ${d.name}/              # ${d.description.substring(0, 40)}...`)
    .join('\n');

  return await renderSdkContextTemplate({
    packageName,
    openApiVersion,
    apiTitle,
    domainTree,
    domainsSection,
    disambiguation
  });
}

/**
 * Prompt the user for disambiguation notes
 * @param domains Map of domains
 * @param existingDisambiguation Existing disambiguation notes
 * @param hasCustomDescriptions Whether the user provided custom descriptions
 * @param domainDescriptionsFileName Name of the domain descriptions file
 * @param logger Logger instance
 * @returns Disambiguation notes
 */
async function promptForDisambiguation(
  domains: Map<string, Domain>,
  existingDisambiguation: string,
  hasCustomDescriptions: boolean,
  domainDescriptionsFileName: string | undefined,
  logger: Logger
): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((res) => rl.question(prompt, res));
  };

  logger.log(`
=== SDK Context Update - Interactive Mode ===
Computed domain descriptions:
`);
  domains.forEach((domain) => {
    logger.log(`
    • ${domain.name}
        Description: ${domain.description}
        Operations: ${domain.operations.length}
        Models: ${domain.models.size}
`);
  });

  if (hasCustomDescriptions) {
    logger.log(`(Using custom descriptions from --domain-descriptions file)`);
  }

  const confirmDomains = await question('\nAre these domain descriptions correct? (y/n): ');
  if (confirmDomains.toLowerCase() !== 'y') {
    const overrideFile = domainDescriptionsFileName || DOMAIN_DESCRIPTIONS_FILENAME;
    logger.log(`
To modify domain descriptions, edit the override file:
  File: ${overrideFile}
  Format: { "domainName": "description", ... }
`);
    rl.close();
    throw new Error(
      hasCustomDescriptions
        ? `User rejected domain descriptions. Please edit the ${overrideFile} file and re-run this command.`
        : `User rejected domain descriptions. Create ${overrideFile} and run: amasdk-update-sdk-context --interactive --domain-descriptions ${overrideFile}`);
  }

  logger.log(`
--- Disambiguation Notes ---
  Add any clarifications AI tools should know about your SDK.
  Examples: naming conventions, domain relationships, custom extensions, known limitations.
`);

  if (existingDisambiguation) {
    logger.log(`
Existing notes:
      ${existingDisambiguation}
`);
    const keepExisting = await question(`
Keep existing disambiguation notes? (y/n): `);
    if (keepExisting.toLowerCase() === 'y') {
      const addMore = await question('Add more notes? (y/n): ');
      if (addMore.toLowerCase() === 'y') {
        const additional = await question('Enter additional notes (single line): ');
        rl.close();
        return `
${existingDisambiguation}
${additional}
`;
      }
      rl.close();
      return existingDisambiguation;
    }
  }

  const newNotes = await question(`
Enter disambiguation notes (or press Enter to skip):
`);
  rl.close();
  return newNotes || '';
}

/**
 * Get the cpy-cli version from `@ama-sdk/schematics` package.json
 */
function getCpyCliVersion(): string | null {
  const schematicsPackagePath = join(__dirname, '../../../package.json');
  try {
    const schematicsPackageJson = JSON.parse(readFileSync(schematicsPackagePath, 'utf8')) as PackageJson;
    return schematicsPackageJson.devDependencies?.['cpy-cli'] || null;
  } catch {
    return null;
  }
}

/**
 * Adds a prepare:context script to package.json that copies SDK_CONTEXT.md to dist/
 * and updates the build script to include prepare:context if needed.
 * @param packageJsonPath - Path to the package.json file
 * @param logger - Logger instance
 */
async function addPrepareContextScript(packageJsonPath: string, logger: Logger): Promise<void> {
  try {
    if (!existsSync(packageJsonPath)) {
      logger.error(`Package.json not found at: ${packageJsonPath}`);
      return;
    }

    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;

    // Initialize scripts object if it doesn't exist
    packageJson.scripts ||= {};

    // Initialize devDependencies object if it doesn't exist
    packageJson.devDependencies ||= {};

    // Check if cpy-cli is available as dev dependency, install if missing
    if (!packageJson.devDependencies['cpy-cli']) {
      const cpyCliVersion = getCpyCliVersion();
      if (cpyCliVersion) {
        logger.log(`Installing cpy-cli@${cpyCliVersion} as dev dependency...`);
        try {
          const targetDir = dirname(packageJsonPath);
          execFileSync(
            getPackageManager(),
            [
              ...getPackageManager() === 'npm' ? ['install', '--save-dev'] : ['add', '--dev'],
              `cpy-cli@${cpyCliVersion}`
            ],
            { cwd: targetDir, stdio: 'pipe', shell: process.platform === 'win32' }
          );
          packageJson.devDependencies['cpy-cli'] = cpyCliVersion;
          logger.log(`Successfully installed cpy-cli@${cpyCliVersion}`);
        } catch (error) {
          logger.warn(`Failed to install cpy-cli: ${error instanceof Error ? error.message : String(error)}. Please install it manually.`);
        }
      } else {
        logger.warn(`cpy-cli is required but version could not be determined. Please install it manually with: npm install --save-dev cpy-cli`);
      }
    }

    // Add the prepare:context script if it doesn't exist
    if (packageJson.scripts['prepare:context']) {
      logger.log(`'prepare:context' script already exists in package.json`);
    } else {
      packageJson.scripts['prepare:context'] = 'cpy SDK_CONTEXT.md dist/';
      logger.log(`Added 'prepare:context' script to package.json`);
    }

    // Update build script to include prepare:context if it exists and doesn't already include it
    if (packageJson.scripts.build && !packageJson.scripts.build.includes('prepare:context')) {
      packageJson.scripts.build = `${packageJson.scripts.build} && npm run prepare:context`;
      logger.log(`Updated 'build' script to include 'prepare:context'`);
    }

    // Write the updated package.json back to file
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    logger.log(`Package.json updated successfully: ${packageJsonPath}`);
  } catch {
    // Ignore errors for now
  }
}

/**
 * Generate the SDK_CONTEXT.md file
 * @param projectPath Path to the project root
 * @param specFileName Name of the OpenAPI spec file
 * @param domainDescriptionsFileName Name of the domain descriptions file
 * @param isInteractive Whether to run in interactive mode
 * @param prepareScript Whether to add a prepare:context script to package.json
 * @param logger Logger instance
 */
export const generateSdkContext = async (
  projectPath: string,
  specFileName: string | undefined,
  domainDescriptionsFileName: string | undefined,
  isInteractive: boolean,
  prepareScript: boolean | undefined,
  logger: Logger
) => {
  logger.log(`Loading OpenAPI spec from: ${projectPath}`);

  const spec = loadOpenAPISpec(projectPath, specFileName);
  const customDescriptions = domainDescriptionsFileName ? loadDomainDescriptions(join(projectPath, domainDescriptionsFileName)) : null;
  const domains = extractDomains(spec, customDescriptions);
  const packageJson = loadPackageJson(projectPath);
  const packageName = packageJson.name || basename(projectPath);

  logger.log(`Found ${domains.size} domains with ${Array.from(domains.values()).reduce((sum, d) => sum + d.operations.length, 0)} operations`);

  let disambiguation = loadExistingDisambiguation(projectPath);

  if (isInteractive) {
    disambiguation = await promptForDisambiguation(domains, disambiguation, !!customDescriptions, projectPath, logger);
  }

  const contextContent = await generateContextFile(spec, domains, packageName, disambiguation);
  const outputPath = join(projectPath, 'SDK_CONTEXT.md');

  await fs.writeFile(outputPath, contextContent, 'utf8');
  logger.log(`
    SDK context written to: ${outputPath}
    --- Domain Summary ---
  `);
  domains.forEach((domain) => {
    logger.log(`${domain.name}:`);
    domain.operations.forEach((op) => {
      logger.log(`  - ${op.operationId}`);
    });
  });

  // Handle prepare script addition if requested
  if (prepareScript) {
    const targetPackageJsonPath = join(projectPath, 'package.json');
    await addPrepareContextScript(targetPackageJsonPath, logger);
  }
};
