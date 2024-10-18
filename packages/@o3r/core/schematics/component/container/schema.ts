import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgGenerateComponentContainerSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** name of the component to generate */
  componentName: string;

  /** Selector prefix */
  prefix?: string | undefined;

  /** Component Structure */
  componentStructure: 'full' | 'container';

  /** Description of the component generated */
  description?: string | undefined;

  /** Component Folder */
  path?: string | undefined;

  /** Indicates if the component should generate fixtures */
  useComponentFixtures?: boolean | undefined;

  /** Indicates if the component should use otter configuration */
  useOtterConfig?: boolean | undefined;

  /** Indicates if the component should use generate context */
  useContext?: boolean | undefined;

  /** Indicates if the component should use rules-engine */
  useRulesEngine?: boolean | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Whether the generated component is standalone */
  standalone: boolean;
}
