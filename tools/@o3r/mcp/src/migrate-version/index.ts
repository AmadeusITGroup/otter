import {
  readFile,
} from 'node:fs/promises';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  z,
} from 'zod';

/**
 * Extract Otter version from package.json.
 * @param packageJsonPath Path to package.json
 */
async function getCurrentOtterVersion(packageJsonPath: string): Promise<string | null> {
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const dependencies: Record<string, string> = { ...packageJson.dependencies, ...packageJson.devDependencies };

    for (const [pkg, version] of Object.entries(dependencies)) {
      if (pkg.startsWith('@o3r/')) {
        const versionMatch = version.match(/(\d+\.\d+)/);
        if (versionMatch) {
          return versionMatch[1];
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect the package manager used in the project.
 * @param packageJsonPath Path to package.json
 */
async function detectPackageManager(packageJsonPath: string): Promise<'yarn' | 'npm'> {
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as { packageManager?: string };
    return packageJson.packageManager?.startsWith('yarn') ? 'yarn' : 'npm';
  } catch {
    return 'npm';
  }
}

const OUTPUT_TEMPLATE = `
# Otter Version Migration

**Current version:** <currentVersion>

**Available releases:** <availableReleases>

## Migration Instructions

<migrationInstructions>

---

**Additional resources:**
- [Migration guides](https://github.com/AmadeusITGroup/otter/tree/main/migration-guides)
- [Release notes](https://github.com/AmadeusITGroup/otter/releases)
`;

const DESCRIPTION = `
Use this tool to help users migrate their Otter project to a newer version.

**Workflow:**
1. Call this tool to get the current Otter version from the user's \`package.json\`
2. If no target version is specified, call \`get_supported_releases_amadeusitgroup/otter\` to fetch available releases
3. Compare the current version with available releases to identify newer versions
4. Present the newer versions to the user and ask which one they want to migrate to
5. Call this tool again with the target version to get migration instructions
`;

/**
 * Register the migrate version tool.
 * @param server MCP server instance
 */
export function registerMigrateVersionTool(server: McpServer) {
  server.registerPrompt(
    'migrate_otter_version',
    {
      title: 'Migrate Otter version'
    },
    () => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: 'Migrate otter version using the tool `migrate_otter_version`'
        }
      }]
    })
  );
  server.registerTool(
    'migrate_otter_version',
    {
      title: 'Migrate Otter version',
      description: DESCRIPTION,
      inputSchema: {
        packageJsonPath: z
          .string()
          .describe('Absolute path to the package.json file in the user\'s project. Defaults to \'./package.json\' if not provided.')
          .optional(),
        targetVersion: z
          .string()
          .describe('The target Otter version to migrate to (e.g., "11.0", "12.0", "13.0"). If not provided, the tool will list available versions.')
          .optional()
      }
    },
    async ({ packageJsonPath = './package.json', targetVersion }) => {
      const currentVersion = await getCurrentOtterVersion(packageJsonPath);

      if (!currentVersion) {
        return {
          content: [
            {
              type: 'text',
              text: 'Could not detect Otter version in package.json. Make sure your project has @o3r/* packages installed.'
            }
          ]
        };
      }

      if (!targetVersion) {
        return {
          content: [
            {
              type: 'text',
              text: OUTPUT_TEMPLATE
                .replace('<currentVersion>', currentVersion)
                .replace('<availableReleases>', 'Use the `get_supported_releases_amadeusitgroup/otter` tool to see available releases.')
                .replace('<migrationInstructions>', 'Please specify a target version to get migration instructions.')
            }
          ]
        };
      }

      if (currentVersion === targetVersion) {
        return {
          content: [
            {
              type: 'text',
              text: `Your project is already on Otter version ${currentVersion}. No migration needed.`
            }
          ]
        };
      }

      // Compare versions
      const [currentMajor] = currentVersion.split('.').map(Number);
      const [targetMajor] = targetVersion.split('.').map(Number);

      // Check if upgrading more than 1 major version
      const majorVersionDiff = targetMajor - currentMajor;
      if (majorVersionDiff > 1) {
        const nextMajorVersion = `${currentMajor + 1}.0`;
        return {
          content: [
            {
              type: 'text',
              text: [
                `⚠️ **Cannot skip major versions**`,
                '',
                `You are trying to upgrade from **${currentVersion}** to **${targetVersion}**, which skips ${majorVersionDiff - 1} major version(s).`,
                '',
                'Otter requires incremental major version upgrades to ensure proper migration of breaking changes.',
                '',
                `**Next step:** Migrate to version **${nextMajorVersion}** first.`,
                '',
                `After successfully migrating to ${nextMajorVersion}, you can then migrate to the next major version.`,
                '',
                'Use `get_supported_releases_amadeusitgroup/otter` to see available versions.'
              ].join('\n')
            }
          ]
        };
      }

      // Instruct to validate the target version exists
      const validationInstruction = [
        `**Before proceeding with migration to ${targetVersion}:**`,
        '',
        '1. Call `get_supported_releases_amadeusitgroup/otter` to get the list of available releases',
        `2. Verify that version **${targetVersion}** exists in the supported releases`,
        '3. If the version does not exist, inform the user and ask them to choose a valid version',
        '4. If the version exists, provide the migration instructions below',
        ''
      ].join('\n');

      const packageManager = await detectPackageManager(packageJsonPath);
      const migrationCommand = `${packageManager} ${packageManager === 'yarn' ? '' : 'exec '}ng update @o3r/core@~${targetVersion}`;

      const migrationInstructions = `${validationInstruction}

## Migration Instructions

To migrate from ${currentVersion} to ${targetVersion}:

1. **Review the migration guide:**
   - Check [migration-guides/${targetVersion}.md](https://github.com/AmadeusITGroup/otter/blob/main/migration-guides/${targetVersion}.md) for breaking changes

2. **Run the migration command:**
   \`\`\`bash
   ${migrationCommand}
   \`\`\`

3. **Test your application:**
   - Run tests: \`${packageManager} test\`
   - Build: \`${packageManager} build\`
   - Verify functionality in development

4. **Commit the changes:**
   - Review all changes made by the migration
   - Commit with message: \`chore: migrate to Otter ${targetVersion}\``;

      return {
        content: [
          {
            type: 'text',
            text: OUTPUT_TEMPLATE
              .replace('<currentVersion>', currentVersion)
              .replace('<availableReleases>', `Target version: ${targetVersion}`)
              .replace('<migrationInstructions>', migrationInstructions)
          }
        ]
      };
    }
  );
}
