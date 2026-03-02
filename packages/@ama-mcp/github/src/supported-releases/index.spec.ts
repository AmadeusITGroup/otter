const paginate = jest.fn().mockImplementation(() => {
  return [
    { name: 'main' },
    { name: 'release/1.0' },
    { name: 'release/1.1' },
    { name: 'release/2.0' },
    { name: 'release/2.1.0-rc' },
    { name: 'release/3.0.0-next' }
  ];
});

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      paginate,
      repos: {
        listBranches: jest.fn()
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
  registerSupportedReleasesTool,
} from './index';

const setUpClientAndServer = async () => {
  const mcpServer = new McpServer({
    name: 'test-supported-releases-server',
    version: '1.0.0'
  });
  await registerSupportedReleasesTool(mcpServer, {
    githubToken: 'fakeToken',
    libraryName: 'TestAmaMcpLibrary',
    owner: 'testOrg',
    repo: 'testRepo'
  });
  return setUpClientAndServerForTesting(mcpServer);
};

describe('Supported releases', () => {
  it('should have registered the tool', async () => {
    const { client } = await setUpClientAndServer();
    const { tools } = await client.listTools();
    expect(tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'get_supported_releases_testamamcplibrary' })
    ]));
  });

  it('should return the supported releases', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'get_supported_releases_testamamcplibrary' });
    expect(response.content).toEqual([
      expect.objectContaining({
        type: 'text',
        text: 'The supported releases for TestAmaMcpLibrary are: \n  - 1.0\n  - 1.1\n  - 2.0'
      })
    ]);
    expect(response.structuredContent).toEqual(expect.objectContaining({
      releases: [
        '1.0',
        '1.1',
        '2.0'
      ]
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
