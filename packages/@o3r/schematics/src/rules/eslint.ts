import type { Rule } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { getFilesToLintAndConfigFromTree } from '../rule-factories';

/**
 * Rule to run eslint on modified files
 */
export const eslintRule: Rule = (t, c) => {
  const { files, configFile } = getFilesToLintAndConfigFromTree(t, c);
  c.addTask(
    new RunSchematicTask('@o3r/schematics', 'eslint', {
      files,
      configFile
    })
  );
};
