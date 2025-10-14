import {
  readFile,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  uriPrefix,
} from '../utils/otter';
import {
  resourceRegistry,
} from '../utils/resource-registry';

const uri = `${uriPrefix}best-practices`;

async function registerBestPracticesResources(server: McpServer, bestPracticesResourcesPath: string) {
  const content = await readFile(
    join(bestPracticesResourcesPath, 'output.md'),
    { encoding: 'utf8' }
  );
  resourceRegistry.set(uri, content);
  server.registerResource(
    'Best Practices Guide',
    uri,
    {
      title: 'Otter Best Practices and Code Generation Guide',
      description: await readFile(
        join(bestPracticesResourcesPath, 'description.md'),
        { encoding: 'utf8' }
      ),
      mimeType: 'text/markdown'
    },
    () => ({ contents: [{ uri, text: content }] })
  );
}

async function registerBestPracticesTool(server: McpServer, bestPracticesResourcesPath: string) {
  server.registerTool(
    'get_best_practices',
    {
      title: 'Get Otter Coding Best Practices Guide',
      description: await readFile(
        join(bestPracticesResourcesPath, 'description.md'),
        { encoding: 'utf8' }
      ),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      }
    },
    () => ({
      content: [
        {
          type: 'text',
          text: resourceRegistry.get(uri) || 'Not found'
        },
        {
          type: 'resource_link',
          name: 'Best practices',
          uri
        }
      ]
    })
  );
}

/**
 * Register the best practices tool and resources.
 * @param server
 * @param resourcesPath
 */
export function registerBestPracticesToolAndResources(server: McpServer, resourcesPath: string) {
  const bestPracticesResourcesPath = join(resourcesPath, 'best-practices');
  return Promise.allSettled([
    registerBestPracticesResources(server, bestPracticesResourcesPath),
    registerBestPracticesTool(server, bestPracticesResourcesPath)
  ]);
}
