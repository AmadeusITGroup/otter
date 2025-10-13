const readFile = jest.fn();
const registerGetRepositoriesUsingLibraryTool = jest.fn();
const registerSupportedReleasesTool = jest.fn();
const registerReleaseNotes = jest.fn();

jest.mock('node:fs/promises', () => {
  const originalFs = jest.requireActual('node:fs/promises');
  return {
    ...originalFs,
    readFile
  };
});
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn()
  };
});
jest.mock('@ama-mcp/github', () => {
  const originalModule = jest.requireActual('@ama-mcp/github');
  return {
    ...originalModule,
    registerGetRepositoriesUsingLibraryTool,
    registerSupportedReleasesTool,
    registerReleaseNotes
  };
});

/* eslint-disable import/first -- important to be after the mock */

import {
  join,
} from 'node:path';
import {
  setUpClientAndServerForTesting,
} from '@ama-mcp/core';
import {
  createMcpServer,
} from './mcp-server';

const setUpClientAndServer = async () => {
  readFile.mockImplementation((path) => {
    if (path.toString().endsWith(join('package.json'))) {
      return Promise.resolve(JSON.stringify({ name: '@o3r/mcp', version: '1.0.0' }));
    }
    if (path.toString().endsWith(join('create', 'output.md'))) {
      return Promise.resolve('This tool helps you create a monorepo <repositoryName> with an application <applicationName>.');
    }
    if (path.toString().endsWith(join('best-practices', 'output.md'))) {
      return Promise.resolve('## Best Practices\n\nSome best practices content.');
    }
    return Promise.resolve('File content');
  });
  const mcpServer = await createMcpServer();
  return setUpClientAndServerForTesting(mcpServer);
};

describe('MCP server', () => {
  beforeEach(() => {
    process.env.O3R_MCP_GITHUB_TOKEN = 'fake-token';
  });

  it('should have tools, resources, resourceTemplates set up', async () => {
    const { client } = await setUpClientAndServer();
    const { tools } = await client.listTools();
    expect(tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'get_best_practices' }),
      expect.objectContaining({ name: 'create_monorepo_with_app' })
    ]));
    const { resources } = await client.listResources();
    expect(resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ uri: 'o3r://best-practices' })
    ]));
    expect(registerGetRepositoriesUsingLibraryTool).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        githubToken: process.env.O3R_MCP_GITHUB_TOKEN,
        libraryName: 'Otter',
        scopes: expect.any(Array)
      }),
      expect.anything());
    expect(registerSupportedReleasesTool).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        githubToken: process.env.O3R_MCP_GITHUB_TOKEN,
        owner: 'AmadeusITGroup',
        repo: 'otter',
        libraryName: 'Otter'
      }),
      expect.anything());
    expect(registerReleaseNotes).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        githubToken: process.env.O3R_MCP_GITHUB_TOKEN,
        owner: 'AmadeusITGroup',
        repo: 'otter',
        libraryName: 'Otter',
        uriPrefix: 'o3r'
      }),
      expect.anything()
    );
  });

  it('should get best practices', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'get_best_practices' });
    expect(response.content).toEqual(expect.arrayContaining([
      {
        type: 'text',
        text: '## Best Practices\n\nSome best practices content.'
      },
      expect.objectContaining({
        type: 'resource_link',
        uri: 'o3r://best-practices'
      })
    ]));
  });

  it('should create a monorepo with app', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({
      name: 'create_monorepo_with_app',
      arguments: {
        repositoryName: 'my-repo',
        applicationName: 'my-app'
      }
    });
    expect(response.content).toEqual([{
      type: 'text',
      text: 'This tool helps you create a monorepo my-repo with an application my-app.'
    }]);
  });

  afterEach(() => {
    delete process.env.O3R_MCP_GITHUB_TOKEN;
    jest.clearAllMocks();
  });
});
