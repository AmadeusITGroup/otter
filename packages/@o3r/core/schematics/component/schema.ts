import type { SchematicOptionObject } from '@o3r/schematics';
import type { ComponentStructure } from './structures.types';

export interface NgGenerateComponentSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Name of the component to generate */
  componentName: string;

  /** Selector prefix */
  prefix?: string | undefined;

  /** Component Structure */
  componentStructure: ComponentStructure;

  /** Description of the component generated */
  description?: string | undefined;

  /** Component Folder */
  path?: string | undefined;

  /** Indicates if the component should generate fixtures */
  useComponentFixtures?: boolean | undefined;

  /** Indicates if the component should use otter theming architecture */
  useOtterTheming?: boolean | undefined;

  /** Indicates if the component should use Design Token Specifications */
  useOtterDesignToken?: boolean | undefined;

  /** Indicates if the component should use otter configuration */
  useOtterConfig?: boolean | undefined;

  /** Indicates if the component should use rules-engine */
  useRulesEngine?: boolean | undefined;

  /** Indicates if the component should use localization */
  useLocalization: boolean;

  /** Indicates if the component should use generate context */
  useContext?: boolean | undefined;

  /** Determine if the dummy IO should be generated */
  activateDummy: boolean;

  /** Generate component with Otter analytics architecture */
  useOtterAnalytics?: boolean | undefined;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Whether the generated component is standalone */
  standalone: boolean;
}
