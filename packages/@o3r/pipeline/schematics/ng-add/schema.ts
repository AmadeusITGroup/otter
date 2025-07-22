import type {
  SchematicOptionObject,
} from '@o3r/schematics';

type Toolchains = 'github';

export interface NgAddSchematicsSchema extends SchematicOptionObject {

  /** The DevOps toolchain to create */
  toolchain: Toolchains;

  /** The CI runner */
  runner: string;

  /** A custom npm registry */
  npmRegistry?: string | undefined;
}
