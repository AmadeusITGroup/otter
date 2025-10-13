import {
  type McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp';
import {
  Octokit,
  type RestEndpointMethodTypes,
} from '@octokit/rest';
import {
  z,
} from 'zod';
import {
  logger,
} from '../utils/logger';
import {
  owner,
  repo,
  uriPrefix,
} from '../utils/otter';
import {
  resourceRegistry,
} from '../utils/resource-registry';

const getUri = (tagName: string) => `${uriPrefix}release-notes/${tagName}`;
const formatContent = (releaseNote: RestEndpointMethodTypes['repos']['getReleaseByTag']['response']['data']) => `# ${releaseNote.tag_name}\n\n${releaseNote.body}`;

async function getReleaseNotes(octokit: Octokit) {
  const minorsReleaseNotes = (await octokit.paginate(octokit.repos.listReleases, { owner, repo }))
    .filter((release) => /^v\d+\.\d+\.0$/.test(release.tag_name));
  const releaseNotes = new Map(minorsReleaseNotes.map((releaseNote) => [releaseNote.tag_name, releaseNote]));
  releaseNotes.forEach((value) => resourceRegistry.set(getUri(value.tag_name), formatContent(value)));
  return releaseNotes;
}

function registerReleaseNotesResources(server: McpServer, releaseNotes: Awaited<ReturnType<typeof getReleaseNotes>>) {
  server.registerResource(
    `Otter release notes`,
    new ResourceTemplate(
      getUri('{tagName}'),
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
      description: `${owner}/${repo}'s release notes`,
      mimeType: 'text/markdown'
    },
    (uri, { tagName }) => ({
      contents: [({
        uri: uri.href,
        text: formatContent(releaseNotes.get(tagName as string)!),
        mimeType: 'text/markdown'
      })]
    })
  );
}

function registerReleaseNotesTool(server: McpServer, releaseNotes: Awaited<ReturnType<typeof getReleaseNotes>>) {
  server.registerTool(
    'get_release_notes',
    {
      title: 'Get Otter release notes',
      description: 'Get the release notes for the latest Otter releases',
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
            const uri = getUri(releaseNote.tag_name);
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
 */
export async function registerReleaseNotes(server: McpServer) {
  if (!process.env.O3R_MCP_GITHUB_TOKEN) {
    logger.error('Missing O3R_MCP_GITHUB_TOKEN environment variable for get_release_notes tool');
    return;
  }

  const octokit = new Octokit({ auth: process.env.O3R_MCP_GITHUB_TOKEN });
  const releaseNotes = await getReleaseNotes(octokit);
  logger.info(`Found ${releaseNotes.size} release notes`, releaseNotes);
  registerReleaseNotesResources(server, releaseNotes);
  registerReleaseNotesTool(server, releaseNotes);
}
