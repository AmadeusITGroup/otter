const paginate = jest.fn();
const code = jest.fn();
const getBranch = jest.fn();
const getTree = jest.fn();
const getContent = jest.fn();
const readFile = jest.fn();
const writeFile = jest.fn();

jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      paginate,
      repos: {
        getBranch,
        getContent
      },
      git: {
        getTree
      },
      search: {
        code
      }
    }))
  };
});
jest.mock('node:fs/promises', () => {
  const originalFs = jest.requireActual('node:fs/promises');
  return {
    ...originalFs,
    readFile,
    writeFile
  };
});

/* eslint-disable import/first -- important to be after the mock */
import {
  tmpdir,
} from 'node:os';
import {
  join,
} from 'node:path';
import {
  Client,
} from '@modelcontextprotocol/sdk/client';
import {
  InMemoryTransport,
} from '@modelcontextprotocol/sdk/inMemory.js';
import {
  createMcpServer,
} from './mcp-server';

const setupClientAndServer = async () => {
  readFile.mockImplementation((path) => {
    if (path.toString().endsWith(join('package.json'))) {
      return Promise.resolve(JSON.stringify({ name: '@o3r/mcp', version: '1.0.0' }));
    }
    if (path.toString().endsWith(join('create', 'output.md'))) {
      return Promise.resolve('This tool helps you create a monorepo <repositoryName> with an application <applicationName>.');
    }
    if (path.toString().endsWith('repos-using-otter.json')) {
      return Promise.resolve(JSON.stringify({ 'testOrg/repoCached': true }));
    }
    return Promise.resolve('File content');
  });
  const mcpServer = await createMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  });
  await Promise.all([
    client.connect(clientTransport),
    mcpServer.server.connect(serverTransport)
  ]);
  return { mcpServer, client };
};

describe('MCP server', () => {
  beforeEach(() => {
    process.env.O3R_MCP_GITHUB_TOKEN = 'fake-token';
    process.env.O3R_MCP_USE_CACHED_REPOS = 'false';
  });

  it('should have 3 tools', async () => {
    const { client } = await setupClientAndServer();
    const { tools } = await client.listTools();
    expect(tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'get_best_practices' }),
      expect.objectContaining({ name: 'create_monorepo_with_app' }),
      expect.objectContaining({ name: 'get_repositories_using_otter' })
    ]));
  });

  it('should get best practices', async () => {
    const { client } = await setupClientAndServer();
    readFile.mockResolvedValueOnce('## Best Practices\n\nSome best practices content.');
    readFile.mockResolvedValueOnce('Developer guide content.');
    const response = await client.callTool({ name: 'get_best_practices' });
    expect(response.content).toEqual([{
      type: 'text',
      text: 'Developer guide content.\n\n## Best Practices\n\nSome best practices content.'
    }]);
  });

  it('should create a monorepo with app', async () => {
    const { client } = await setupClientAndServer();
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

  describe('should find repositories using Otter dependencies', () => {
    beforeEach(() => {
      paginate.mockImplementation(() => {
        return [
          { repository: { name: 'repo1', full_name: 'testOrg/repo1', default_branch: 'main' } },
          { repository: { name: 'repo2', full_name: 'testOrg/repo2', default_branch: 'main' } }
        ];
      });
      getBranch.mockImplementation(({ repo }) => {
        if (repo === 'repo1') {
          return Promise.resolve({
            data: {
              commit: { sha: 'sha-repo1' }
            }
          });
        } else if (repo === 'repo2') {
          return Promise.resolve({
            data: {
              commit: { sha: 'sha-repo2' }
            }
          });
        }
        return Promise.reject(new Error('Repository not found'));
      });
      getTree.mockImplementation(({ repo }) => {
        if (repo === 'repo1') {
          return Promise.resolve({
            data: {
              tree: [
                { type: 'blob', path: 'package.json' },
                { type: 'blob', path: 'src/index.ts' },
                { type: 'blob', path: 'libs/@scope/name/package.json' }
              ]
            }
          });
        } else if (repo === 'repo2') {
          return Promise.resolve({
            data: {
              tree: [
                { type: 'blob', path: 'src/index.ts' },
                { type: 'blob', path: 'README.md' }
              ]
            }
          });
        }
        return Promise.reject(new Error('Tree not found'));
      });
      getContent.mockImplementation(({ repo, path }) => {
        if (repo === 'repo1' && path === 'package.json') {
          return Promise.resolve({
            data: {
              encoding: 'base64',
              type: 'file',
              content: Buffer.from(JSON.stringify({
                dependencies: {
                  '@o3r/some-package': '^1.0.0'
                }
              })).toString('base64')
            }
          });
        } else if (repo === 'repo1' && path === 'libs/@scope/name/package.json') {
          return Promise.resolve({
            data: {
              encoding: 'base64',
              type: 'file',
              content: Buffer.from(JSON.stringify({
                dependencies: {
                  'some-other-package': '^1.0.0'
                }
              })).toString('base64')
            }
          });
        }
        return Promise.reject(new Error('Content not found'));
      });
    });

    it('without cache', async () => {
      const { client } = await setupClientAndServer();
      const response = await client.callTool({ name: 'get_repositories_using_otter' });
      expect(response.content).toEqual([{
        type: 'text',
        text: 'The following repositories use Otter dependencies:\n- testOrg/repo1'
      }]);
    });

    it('with cache', async () => {
      delete process.env.O3R_MCP_USE_CACHED_REPOS;
      process.env.O3R_MCP_CACHE_PATH = tmpdir();
      const { client } = await setupClientAndServer();
      const response = await client.callTool({ name: 'get_repositories_using_otter' });
      expect(writeFile).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/repos-using-otter\.json$/),
        JSON.stringify({
          'testOrg/repo1': true,
          'testOrg/repo2': false,
          'testOrg/repoCached': true
        })
      );
      expect(response.content).toEqual([{
        type: 'text',
        text: 'The following repositories use Otter dependencies:\n- testOrg/repo1\n- testOrg/repoCached'
      }]);
    });
  });

  afterEach(() => {
    delete process.env.O3R_MCP_GITHUB_TOKEN;
    delete process.env.O3R_MCP_USE_CACHED_REPOS;
    delete process.env.O3R_MCP_CACHE_PATH;
    jest.clearAllMocks();
  });
});
