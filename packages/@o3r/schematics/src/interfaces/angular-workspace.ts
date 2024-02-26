/* eslint-disable @typescript-eslint/naming-convention */
// FIXME: The interface has been removed in angular 11 https://github.com/angular/angular-cli/commit/df70c7a85770fe50cc4c2d67589dc2d37f27d0b1
import type {
  Projects as NgWorkspaceProject,
  Schema as NgWorkspaceSchema,
  SchematicOptions
} from '@angular/cli/lib/config/workspace-schema';

/**
 * Type representing supported testing frameworks: 'jest' or 'jasmine'.
 */
export type AvailableTestFrameworks = 'jest' | 'jasmine';

export interface WorkspaceProjectI18n {
  locales: Record<string, string>;
  sourceLocale?: string;
}
export interface WorkspaceTool {
  [k: string]: any;
}

/** Defines the directories where the apps/libs will stay inside a monorepo */
export interface WorkspaceLayout {
  /** Libraries directory name */
  libsDir: string;
  /** Applications directory name */
  appsDir: string;
}


export interface WorkspaceSchematics extends SchematicOptions {
  '@o3r/core:component'?: {
    path: string;
  } & WorkspaceSchematics['*:*'];
  '@o3r/core:service'?: {
    path: string;
  } & WorkspaceSchematics['*:*'];
  '@o3r/core:store'?: {
    path: string;
  } & WorkspaceSchematics['*:*'];
  '@o3r/core:schematics'?: {
    path: string;
  } & WorkspaceSchematics['*:*'];
  '*:ng-add'?: {
    enableMetadataExtract?: boolean;
    registerDevtool?: boolean;
  } & WorkspaceSchematics['*:*'];
  '*:*'?: WorkspaceLayout & {
    /** in addition to the WorkspaceLayout, an optional testFramework attribute is available */
    testFramework?: AvailableTestFrameworks;
  };
}
export interface WorkspaceProject extends NgWorkspaceProject {
  name?: string;
  architect?: WorkspaceTool;
  i18n?: WorkspaceProjectI18n;
  prefix: string;
  projectType: 'application' | 'library';
  root: string;
  schematics?: WorkspaceSchematics;
  sourceRoot?: string;
  targets?: WorkspaceTool;
}

export interface WorkspaceSchema extends NgWorkspaceSchema {
  projects: {
    [k: string]: WorkspaceProject;
  };
  schematics?: WorkspaceSchematics;
}

