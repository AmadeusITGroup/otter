import type { SchematicOptionObject } from '@o3r/schematics';

type SupportedSimpleTypes =
   | 'string'
   | 'boolean'
   | 'Date'
   | 'number'
   | 'null'
   | 'undefined'
   | 'unknown';

export interface NgGenerateOperatorSchematicsSchema extends SchematicOptionObject {
  /** Facts services Folder */
  path: string;

  /** Fact service name */
  name: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Operator with one value */
  unaryOperator: boolean;

  /** Type of the right hand side operator */
  lhsType: SupportedSimpleTypes;

  /** Type of the right hand side operator */
  rhsType: SupportedSimpleTypes;
}
