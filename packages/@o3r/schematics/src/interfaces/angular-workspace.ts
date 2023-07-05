/* eslint-disable @typescript-eslint/naming-convention */
// FIXME: The interface has been removed in angular 11 https://github.com/angular/angular-cli/commit/df70c7a85770fe50cc4c2d67589dc2d37f27d0b1
import type {
  Projects as NgWorkspaceProject,
  Schema as NgWorkspaceSchema,
  SchematicOptions
} from '@angular/cli/lib/config/workspace-schema';

export interface WorkspaceProjectI18n {
  locales: Record<string, string>;
  sourceLocale?: string;
}
export interface WorkspaceTool {
  [k: string]: any;
}

export interface WorkspaceSchematics extends SchematicOptions {
  /** @deprecated */
  '@otter/ng-tools:api-service'?: {
    path: string;
  };
  /** @deprecated */
  '@otter/ng-tools:component'?: {
    path: string;
  };
  /** @deprecated */
  '@otter/ng-tools:service'?: {
    path: string;
  };
  /** @deprecated */
  '@otter/ng-tools:store'?: {
    path: string;
  };
  /** @deprecated */
  '@otter/ng-tools:schematics'?: {
    path: string;
  };

  '@o3r/components:component'?: {
    path: string;
  };
  '@o3r/services:service'?: {
    path: string;
  };
  '@o3r/store:store'?: {
    path: string;
  };
  '@o3r/core:schematics'?: {
    path: string;
  };

}
export interface WorkspaceProject extends NgWorkspaceProject {
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

