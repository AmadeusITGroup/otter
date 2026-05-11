import {
  readFile,
} from 'node:fs/promises';
import {
  join,
  resolve,
} from 'node:path';
import {
  registerAngularSchematicsTool,
} from '@ama-mcp/angular';
import type {
  MCPLogger,
} from '@ama-mcp/core';
import {
  AmaMcpServer,
} from '@ama-mcp/core';
import {
  registerGetRepositoriesUsingLibraryTool,
  registerReleaseNotes,
  registerSupportedReleasesTool,
} from '@ama-mcp/github';
import {
  LIBRARY_NAME as libraryName,
  NPM_PACKAGES_SCOPES as OTTER_SCOPES,
  GITHUB_OWNER as owner,
  GITHUB_REPOSITORY_NAME as repo,
  RESOURCE_URI_PREFIX as uriPrefix,
} from '@ama-mcp/otter';
import {
  sendGenAIEventMetricsIfAuthorized,
} from '@o3r/telemetry';
import {
  registerBestPracticesToolAndResources,
} from './best-practices';
import {
  registerCreateMonorepoWithAppTool,
} from './create-monorepo-with-app';
import {
  registerMigrateVersionTool,
} from './migrate-version';

/**
 * Create an MCP server instance.
 * @param logger
 */
export async function createMcpServer(logger: MCPLogger): Promise<AmaMcpServer> {
  const { name, version } = JSON.parse(await readFile(join(__dirname, '..', 'package.json'), 'utf8')) as { name: string; version: string };
  const server = new AmaMcpServer(
    logger,
    {
      name,
      version
    }
  );
  const resourcesPath = join(__dirname, '..', 'resources');
  const githubToken = process.env.O3R_MCP_GITHUB_TOKEN;
  const cacheDirPath = process.env.O3R_MCP_CACHE_PATH || '.cache/@o3r/mcp';

  void sendGenAIEventMetricsIfAuthorized(name, 'registrationStart', { logger });

  await Promise.allSettled([
    registerBestPracticesToolAndResources(server, resourcesPath),
    registerCreateMonorepoWithAppTool(server, resourcesPath),
    Promise.resolve(registerMigrateVersionTool(server)),
    Promise.resolve(registerAngularSchematicsTool(server, {})),
    ...(githubToken
      ? [
        registerGetRepositoriesUsingLibraryTool(server, {
          libraryName,
          scopes: OTTER_SCOPES,
          githubToken,
          cacheFilePath: resolve(cacheDirPath, 'repos-using-otter.json'),
          cacheEntryExpireAfterDays: Number.isNaN(process.env.O3R_MCP_CACHE_MAX_AGE) ? undefined : +(process.env.O3R_MCP_CACHE_MAX_AGE!)
        }),
        registerSupportedReleasesTool(server, {
          githubToken,
          owner,
          repo,
          libraryName
        }),
        registerReleaseNotes(server, {
          githubToken,
          owner,
          repo,
          libraryName,
          uriPrefix
        })
      ]
      : [
        () => logger.error('Missing O3R_MCP_GITHUB_TOKEN environment variable for github tools')
      ])
  ]);

  void sendGenAIEventMetricsIfAuthorized(name, 'registrationEnd', { logger });

  return server;
}
