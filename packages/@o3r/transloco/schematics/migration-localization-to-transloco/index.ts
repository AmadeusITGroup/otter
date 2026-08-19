import type {
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  chain,
  externalSchematic,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
} from '@o3r/schematics';
import type {
  MigrationLocalizationToTranslocoSchema,
} from './schema';

/**
 * Pre-flight checks before migration
 */
function runPreflightChecks(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!tree.exists('/package.json')) {
      throw new Error('package.json not found');
    }

    // Check if @o3r/localization is installed
    const packageJson = tree.readJson('/package.json') as any;
    const hasLocalization = packageJson.dependencies?.['@o3r/localization']
      || packageJson.devDependencies?.['@o3r/localization']
      || packageJson.peerDependencies?.['@o3r/localization'];

    if (!hasLocalization) {
      throw new Error('@o3r/localization is not installed. Nothing to migrate.');
    }

    context.logger.info('Pre-flight checks passed');
    return tree;
  };
}

/**
 * Remove \@o3r/localization dependency from package.json
 * @param options Migration options
 */
function removeO3rLocalizationDependency(options: MigrationLocalizationToTranslocoSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.verbose) {
      context.logger.info('Removing @o3r/localization from package.json...');
    }

    const packageJsonPath = '/package.json';
    if (!tree.exists(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const packageJson = tree.readJson(packageJsonPath) as any;

    // Remove @o3r/localization from all dependency sections
    const depToRemove = '@o3r/localization';
    if (packageJson.dependencies?.[depToRemove]) {
      delete packageJson.dependencies[depToRemove];
    }
    if (packageJson.devDependencies?.[depToRemove]) {
      delete packageJson.devDependencies[depToRemove];
    }
    if (packageJson.peerDependencies?.[depToRemove]) {
      delete packageJson.peerDependencies[depToRemove];
    }

    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    context.logger.info('✓ Removed @o3r/localization');

    return tree;
  };
}

/**
 * Clean up old message format imports and configuration
 * @param options Migration options
 */
function cleanupMessageFormatReferences(options: MigrationLocalizationToTranslocoSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.verbose) {
      context.logger.info('Cleaning up old message format references...');
    }

    tree.visit((filePath) => {
      if (!filePath.endsWith('.ts')) {
        return;
      }

      const content = tree.readText(filePath);

      // Check if this file has old message format setup
      const hasMessageFormatCompiler = content.includes('TranslateMessageFormatLazyCompiler');
      const hasMessageFormatConfig = content.includes('MESSAGE_FORMAT_CONFIG');

      if (!hasMessageFormatCompiler && !hasMessageFormatConfig) {
        return;
      }

      let newContent = content;

      // Remove MESSAGE_FORMAT_CONFIG imports and usage
      newContent = newContent.replace(/,?\s*MESSAGE_FORMAT_CONFIG\s*,?/g, '');
      newContent = newContent.replace(/\{\s*provide:\s*MESSAGE_FORMAT_CONFIG\s*,\s*useValue:\s*\{\s*\}\s*\}\s*,?\s*/g, '');

      // Remove TranslateMessageFormatLazyCompiler imports and usage
      newContent = newContent.replace(/,?\s*TranslateMessageFormatLazyCompiler\s*,?/g, '');
      newContent = newContent.replace(/,?\s*TranslateCompiler\s*,?/g, '');

      if (newContent !== content) {
        tree.overwrite(filePath, newContent);
        if (options.verbose) {
          context.logger.info(`  ✓ Cleaned up message format references in ${filePath}`);
        }
      }
    });

    return tree;
  };
}

/**
 * Detect if message format is used in the project
 * @param tree
 */
function detectMessageFormatUsage(tree: Tree): boolean {
  let hasMessageFormat = false;

  tree.visit((filePath) => {
    if (!filePath.endsWith('.ts') || hasMessageFormat) {
      return;
    }

    const content = tree.readText(filePath);
    if (content.includes('TranslateMessageFormatLazyCompiler') || content.includes('MESSAGE_FORMAT_CONFIG')) {
      hasMessageFormat = true;
    }
  });

  return hasMessageFormat;
}

/**
 * Transform \@o3r/localization imports and executors to \@o3r/transloco in all TypeScript and config files
 * @param options Migration options
 */
function transformFilesRule(options: MigrationLocalizationToTranslocoSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.verbose) {
      context.logger.info('Transforming @o3r/localization references to @o3r/transloco...');
    }

    tree.visit((filePath) => {
      let regex: RegExp | undefined;
      let replacement: string | undefined;

      // Determine file type and transformation
      if (filePath.endsWith('.ts')) {
        regex = /@o3r\/localization(\/[^'"\s]*)?/g;
        replacement = '@o3r/transloco$1';
      } else if (filePath === '/angular.json' || filePath === '/workspace.json' || filePath.endsWith('/project.json')) {
        regex = /@o3r\/localization:/g;
        replacement = '@o3r/transloco:';
      } else {
        return;
      }

      const content = tree.readText(filePath);
      let newContent = content.replace(regex, replacement);

      // Remove LocalizationModule references (doesn't exist in @o3r/transloco)
      if (filePath.endsWith('.ts')) {
        newContent = newContent.replace(/,?\s*LocalizationModule\s*,?/g, '');
        newContent = newContent.replace(/LocalizationModule\.forRoot\([^)]*\)\s*,?\s*/g, '');
      }

      if (newContent !== content) {
        tree.overwrite(filePath, newContent);
        if (options.verbose) {
          context.logger.info(`  ✓ Transformed ${filePath}`);
        }
      }
    });

    context.logger.info(`✓ Transformed @o3r/localization imports and executors`);
    return tree;
  };
}

/**
 * Migration schematic entry point
 * @param options Migration options
 */
function migrationLocalizationToTranslocoFn(options: MigrationLocalizationToTranslocoSchema): Rule {
  let hasMessageFormat = false;

  return chain([
    (tree: Tree, context: SchematicContext) => {
      context.logger.info('Starting migration from @o3r/localization to @o3r/transloco...');

      // Detect message format usage
      hasMessageFormat = detectMessageFormatUsage(tree);
      if (hasMessageFormat) {
        context.logger.info('✓ Detected message format usage - ng-add will install provideTranslocoMessageformat()');
      }

      return tree;
    },
    runPreflightChecks(),
    removeO3rLocalizationDependency(options),
    cleanupMessageFormatReferences(options),
    externalSchematic('@o3r/transloco', 'ng-add', {
      skipInstall: options.skipInstall,
      skipLinter: options.skipLinter,
      enableMessageFormat: hasMessageFormat
    }),
    transformFilesRule(options),
    (tree: Tree, context: SchematicContext) => {
      context.logger.info('✓ Migration completed successfully');
      context.logger.info('');
      context.logger.info('Next steps:');
      context.logger.info('  1. Install dependencies: npm install (or yarn install)');
      context.logger.info('  2. Migrate ngx-translate API calls to Transloco:');
      context.logger.info('     ng g @jsverse/transloco-schematics:ngx-migrate');
      return tree;
    }
  ]);
}

/**
 * Migrate from \@o3r/localization to \@o3r/transloco
 * @param options Migration options
 */
export const migrationLocalizationToTransloco = (options: MigrationLocalizationToTranslocoSchema) =>
  createOtterSchematic(migrationLocalizationToTranslocoFn)(options);
