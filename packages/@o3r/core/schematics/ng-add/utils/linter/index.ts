import { SchematicContext } from '@angular-devkit/schematics';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';

/**
 * Checks if `eslint` package is installed. If so, ask the user for otter linter rules install.
 * Otherwise displays a message to inform the user that otter linter rules can be added later.
 *
 * @param context Schematics context
 */
export const shouldOtterLinterBeInstalled = async (context: SchematicContext): Promise<boolean> => {
  const linterPackageName = 'eslint';
  let useOtterLinter = false;
  try {
    require.resolve(`${linterPackageName}/package.json`);
    if (context.interactive) {
      useOtterLinter = await askConfirmation(`You already have ESLint installed. Would you like to add otter config rules for ESLint?
Otherwise, you can add them later via this command: ng add @o3r/eslint-config-otter`, true);
    }
  } catch {
    context.logger.info(`ESLint package not installed. Skipping Otter linter phase!
You can add Otter linter config rules later to the project via this command: ng add @o3r/eslint-config-otter`);
  }

  return useOtterLinter;
};
