import {
  MCPLogger,
  resourceRegistry,
  type ResourceToolOptions,
  ToolDefinition,
} from '@ama-mcp/core';
import {
  type McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  Octokit,
  type RestEndpointMethodTypes,
} from '@octokit/rest';
import {
  z,
} from 'zod';
import type {
  GitHubRepositoryToolOptions,
} from '../utils';

/**
 * Options for the tool to get release notes
 */
export interface ReleaseNotesToolOptions extends Partial<ResourceToolOptions>, GitHubRepositoryToolOptions, ToolDefinition {
  /**
   * Optional library name
   */
  libraryName?: string;
}

const getDefaultUriPrefix = (options: ReleaseNotesToolOptions) => options.libraryName || options.repo;
const getUri = (uriPrefix: string, tagName: string) => `${uriPrefix}://release-notes/${tagName}`;
const formatContent = (releaseNote: RestEndpointMethodTypes['repos']['getReleaseByTag']['response']['data']) => `# ${releaseNote.tag_name}\n\n${releaseNote.body}`;

async function getReleaseNotes(octokit: Octokit, options: ReleaseNotesToolOptions) {
  const { owner, repo, uriPrefix = getDefaultUriPrefix(options) } = options;
  const minorsReleaseNotes = (await octokit.paginate(octokit.repos.listReleases, { owner, repo }))
    .filter((release) => /^v\d+\.\d+\.0$/.test(release.tag_name));
  const releaseNotes = new Map(minorsReleaseNotes.map((releaseNote) => [releaseNote.tag_name, releaseNote]));
  releaseNotes.forEach((value) => resourceRegistry.set(getUri(uriPrefix, value.tag_name), formatContent(value)));
  return releaseNotes;
}

function registerReleaseNotesResources(
  server: McpServer,
  releaseNotes: Awaited<ReturnType<typeof getReleaseNotes>>,
  options: ReleaseNotesToolOptions
) {
  const {
    libraryName = `${options.owner}/${options.repo}`,
    uriPrefix = getDefaultUriPrefix(options)
  } = options;
  server.registerResource(
    `${libraryName} release notes`,
    new ResourceTemplate(
      getUri(uriPrefix, '{tagName}'),
      {
        list: undefined,
        complete: {
          tagName: (value: string) => {
            const tagNames = Array.from(releaseNotes.keys());
            return tagNames.filter((tagName) => tagName.startsWith(value));
          }
        }
      }
    ),
    {
      description: `${libraryName}'s release notes`,
      mimeType: 'text/markdown'
    },
    (uri, { tagName }) => ({
      contents: (Array.isArray(tagName) ? tagName : [tagName])
        .filter((tag) => !!releaseNotes.get(tag))
        .map((tag) => ({
          uri: uri.href,
          text: resourceRegistry.get(getUri(uriPrefix, tag))!,
          mimeType: 'text/markdown'
        }))
    })
  );
}

function registerReleaseNotesTool(server: McpServer, releaseNotes: Awaited<ReturnType<typeof getReleaseNotes>>, options: ReleaseNotesToolOptions) {
  const libraryName = options.libraryName || `${options.owner}/${options.repo}`;
  const {
    toolName = `get_release_notes_${libraryName.toLowerCase().replaceAll(/\s+/g, '_')}`,
    toolDescription = `Get the release notes for the ${libraryName} releases`,
    toolTitle = `Get ${libraryName} release notes`,
    uriPrefix = getDefaultUriPrefix(options)
  } = options;
  server.registerTool(
    toolName,
    {
      title: toolTitle,
      description: toolDescription,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      },
      inputSchema: {
        version: z.string().optional()
          .describe('The version of the release notes to get, if not provided all release notes will be returned. Format to use is vX.Y.0, e.g. v13.1.0')
      }
    },
    ({ version }) => {
      const targetedReleaseNote = version && releaseNotes.get(version);
      return {
        content: (targetedReleaseNote ? [targetedReleaseNote] : Array.from(releaseNotes.values()))
          .flatMap((releaseNote) => {
            const uri = getUri(uriPrefix, releaseNote.tag_name);
            return [{
              type: 'text',
              text: resourceRegistry.get(uri) || 'Not found'
            }, {
              type: 'resource_link',
              name: `Release note ${releaseNote.tag_name}`,
              uri
            }];
          })
      };
    }
  );
}

/**
 * Register the release notes tool and resources.
 * @param server
 * @param options
 */
export async function registerReleaseNotes(server: McpServer, options: ReleaseNotesToolOptions) {
  const {
    githubToken,
    libraryName = `${options.owner}/${options.repo}`
  } = options;
  const logger = options.logger ?? new MCPLogger(`release-notes-${libraryName}`, options.logLevel);
  if (!githubToken) {
    logger.error?.(`Missing githubToken for release notes tool and resources for ${libraryName}`);
    return;
  }

  const octokit = new Octokit({ auth: githubToken });
  const releaseNotes = await getReleaseNotes(octokit, options);
  logger.info?.(`Found ${releaseNotes.size} release notes for ${libraryName}`, releaseNotes);
  registerReleaseNotesResources(server, releaseNotes, options);
  registerReleaseNotesTool(server, releaseNotes, options);
}
