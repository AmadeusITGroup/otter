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

export type TypeEnum = 'user' | 'file' | 'file_repo' | 'project' | 'team' | 'workspace' | 'org' | 'plugin' | 'widget';
export type EditorTypeEnum = 'figma' | 'figjam';
export type LinkAccessEnum = 'view' | 'edit' | 'org_view' | 'org_edit' | 'inherit';
export type ProtoLinkAccessEnum = 'view' | 'org_view' | 'inherit';

