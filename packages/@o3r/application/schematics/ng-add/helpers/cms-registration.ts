import { apply, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, template, url } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from '../schema';

/**
 * Register Otter Application module to the application
 * @param options
 */
export const generateCmsConfigFile = (options: NgAddSchematicsSchema): Rule => {
  return async (tree) => {
    const { getWorkspaceConfig } = await import('@o3r/schematics');
    const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '.';
    const templateSource = apply(url('./templates'),
      [
        template({}),
        renameTemplateFiles(),
        move(workingDirectory)
      ]
    );

    return mergeWith(templateSource, MergeStrategy.Default);
  };
};
