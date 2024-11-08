import type {
  SchematicOptionObject,
  WorkspaceProject,
} from '../interfaces';

/**
 * Register the builder to the workspace
 * @param workspaceProject Workspace project to add the builder to
 * @param taskName Name of the task to defined
 * @param taskParameters Parameter of the task to defined
 * @param force Override task if already defined
 * @returns the updated workspace
 */
export function registerBuilder(workspaceProject: WorkspaceProject, taskName: string, taskParameters: SchematicOptionObject, force = false): WorkspaceProject {
  workspaceProject.architect ||= {};
  if (workspaceProject.architect[taskName] && !force) {
    throw new Error(`The builder task ${taskName} already exist`);
  }
  workspaceProject.architect[taskName] = taskParameters;
  return workspaceProject;
}
