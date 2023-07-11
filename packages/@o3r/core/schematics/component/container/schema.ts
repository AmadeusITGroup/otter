import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateComponentContainerSchematicsSchema extends JsonObject {
  /** Project name */
  projectName: string | null;

  /** name of the component to generate */
  componentName: string;

  /** Selector prefix */
  prefix: string | null;

  /** Component Structure */
  componentStructure: 'full' | 'container';

  /** Description of the component generated */
  description: string | null;

  /** Component Folder */
  path: string | null;

  /** Indicates if the component should generate fixtures */
  useComponentFixtures: boolean | null;

  /** Indicates if the component should use otter configuration */
  useOtterConfig: boolean | null;

  /** Indicates if the component should use generate context */
  useContext: boolean | null;

  /** Indicates if the component should use rules-engine */
  useRulesEngine: boolean | null;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Whether the generated component is standalone */
  standalone: boolean;
}
