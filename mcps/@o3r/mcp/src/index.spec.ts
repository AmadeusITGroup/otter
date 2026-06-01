import {
  join,
} from 'node:path';
import {
  MCPLogger,
  setUpClientAndServerForTesting,
} from '@ama-mcp/core';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createMcpServer,
} from './mcp-server';

const { readFile, registerGetRepositoriesUsingLibraryTool, registerSupportedReleasesTool, registerReleaseNotes } = vi.hoisted(() => ({
  readFile: vi.fn(),
  registerGetRepositoriesUsingLibraryTool: vi.fn(),
  registerSupportedReleasesTool: vi.fn(),
  registerReleaseNotes: vi.fn()
}));

vi.mock('node:fs/promises', async (importOriginal) => {
  const originalFs = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...originalFs,
    readFile
  };
});
vi.mock('@octokit/rest', () => {
  return {
    Octokit: vi.fn()
  };
});
vi.mock('@ama-mcp/github', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('@ama-mcp/github')>();
  return {
    ...originalModule,
    registerGetRepositoriesUsingLibraryTool,
    registerSupportedReleasesTool,
    registerReleaseNotes
  };
});

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
  const mcpServer = await createMcpServer(new MCPLogger('Test Logger'));
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
      })
    );
    expect(registerSupportedReleasesTool).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        githubToken: process.env.O3R_MCP_GITHUB_TOKEN,
        owner: 'AmadeusITGroup',
        repo: 'otter',
        libraryName: 'Otter'
      })
    );
    expect(registerReleaseNotes).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        githubToken: process.env.O3R_MCP_GITHUB_TOKEN,
        owner: 'AmadeusITGroup',
        repo: 'otter',
        libraryName: 'Otter',
        uriPrefix: 'o3r'
      })
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
    vi.clearAllMocks();
  });
});
