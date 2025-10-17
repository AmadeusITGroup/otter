const paginate = jest.fn().mockImplementation(() => {
  return [
    { tag_name: 'v1.1.0', body: 'Content of the release note for v1.1.0' },
    { tag_name: 'v1.1.1', body: 'Content of the release note for v1.1.1' },
    { tag_name: 'v1.2.0', body: 'Content of the release note for v1.2.0' },
    { tag_name: 'v2.0.0-next.1', body: 'Content of the release note for v2.0.0-next.1' }
  ];
});

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      paginate,
      repos: {
        listReleases: jest.fn()
      }
    }))
  };
});

/* eslint-disable import/first -- important to be after the mock */

import {
  setUpClientAndServerForTesting,
} from '@ama-mcp/core';
import {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerReleaseNotes,
} from './index';

const setUpClientAndServer = async () => {
  const mcpServer = new McpServer({
    name: 'test-release-notes-server',
    version: '1.0.0',
    capabilities: {
      tools: {}
    }
  });
  await registerReleaseNotes(mcpServer, {
    githubToken: 'fakeToken',
    libraryName: 'TestAmaMcpLibrary',
    owner: 'testOrg',
    repo: 'testRepo',
    uriPrefix: 'prefix'
  });
  return setUpClientAndServerForTesting(mcpServer);
};

describe('MCP server', () => {
  it('should have registered the tool and resource template', async () => {
    const { client } = await setUpClientAndServer();
    const { tools } = await client.listTools();
    expect(tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'get_release_notes_testamamcplibrary' })
    ]));
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates).toEqual(expect.arrayContaining([
      expect.objectContaining({ uriTemplate: 'prefix://release-notes/{tagName}' })
    ]));
  });

  it('should return the requested release note', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'get_release_notes_testamamcplibrary', arguments: {
      version: 'v1.1.0'
    } });
    expect(response.content).toEqual([
      expect.objectContaining({ type: 'text', text: '# v1.1.0\n\nContent of the release note for v1.1.0' }),
      expect.objectContaining({ type: 'resource_link', name: `Release note v1.1.0`, uri: 'prefix://release-notes/v1.1.0' })
    ]);
  });

  it('should return the all release notes', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'get_release_notes_testamamcplibrary', arguments: { version: undefined } });
    expect(response.content).toEqual([
      expect.objectContaining({ type: 'text', text: '# v1.1.0\n\nContent of the release note for v1.1.0' }),
      expect.objectContaining({ type: 'resource_link', name: `Release note v1.1.0`, uri: 'prefix://release-notes/v1.1.0' }),
      expect.objectContaining({ type: 'text', text: '# v1.2.0\n\nContent of the release note for v1.2.0' }),
      expect.objectContaining({ type: 'resource_link', name: `Release note v1.2.0`, uri: 'prefix://release-notes/v1.2.0' })
    ]);
    expect(response.content).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ uri: 'prefix://release-notes/v1.1.1' }),
      expect.objectContaining({ uri: 'prefix://release-notes/v2.0.0-next.1' })
    ]));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
