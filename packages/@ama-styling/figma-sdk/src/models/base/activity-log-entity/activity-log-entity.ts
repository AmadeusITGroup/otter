/**
 * Model: ActivityLogEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ActivityLogFileEntity } from '../activity-log-file-entity';
import { ActivityLogFileRepoEntity } from '../activity-log-file-repo-entity';
import { ActivityLogOrgEntity } from '../activity-log-org-entity';
import { ActivityLogPluginEntity } from '../activity-log-plugin-entity';
import { ActivityLogProjectEntity } from '../activity-log-project-entity';
import { ActivityLogTeamEntity } from '../activity-log-team-entity';
import { ActivityLogUserEntity } from '../activity-log-user-entity';
import { ActivityLogWidgetEntity } from '../activity-log-widget-entity';
import { ActivityLogWorkspaceEntity } from '../activity-log-workspace-entity';

/**
 * The resource the actor took the action on. It can be a user, file, project or other resource types.
 */
export type ActivityLogEntity = ActivityLogFileEntity | ActivityLogFileRepoEntity | ActivityLogOrgEntity | ActivityLogPluginEntity | ActivityLogProjectEntity | ActivityLogTeamEntity | ActivityLogUserEntity | ActivityLogWidgetEntity | ActivityLogWorkspaceEntity;

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['user', 'file', 'file_repo', 'project', 'team', 'workspace', 'org', 'plugin', 'widget'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'user' | 'file' | 'file_repo' | 'project' | 'team' | 'workspace' | 'org' | 'plugin' | 'widget';
/** Array of EditorTypeEnum items */
export const LIST_EDITOR_TYPE_ENUM = ['figma', 'figjam'] as const;

/** List of available values for EditorTypeEnum */
export type EditorTypeEnum = 'figma' | 'figjam';
/** Array of LinkAccessEnum items */
export const LIST_LINK_ACCESS_ENUM = ['view', 'edit', 'org_view', 'org_edit', 'inherit'] as const;

/** List of available values for LinkAccessEnum */
export type LinkAccessEnum = 'view' | 'edit' | 'org_view' | 'org_edit' | 'inherit';
/** Array of ProtoLinkAccessEnum items */
export const LIST_PROTO_LINK_ACCESS_ENUM = ['view', 'org_view', 'inherit'] as const;

/** List of available values for ProtoLinkAccessEnum */
export type ProtoLinkAccessEnum = 'view' | 'org_view' | 'inherit';

