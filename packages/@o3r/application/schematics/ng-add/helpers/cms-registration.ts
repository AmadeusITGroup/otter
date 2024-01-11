import { apply, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, template, url } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from '../schema';
import { getWorkspaceConfig } from '@o3r/schematics';

/**
 * Register Otter Application module to the application
 * @param options
 */
export const generateCmsConfigFile = (options: NgAddSchematicsSchema): Rule => {
  return (tree, context) => {
    const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '.';
    const templateSource = apply(url('./templates'),
      [
        template({}),
        renameTemplateFiles(),
        move(workingDirectory)
      ]
    );

    return mergeWith(templateSource, MergeStrategy.Default)(tree, context);
  };
};
