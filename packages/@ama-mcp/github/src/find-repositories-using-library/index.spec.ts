const paginate = jest.fn().mockImplementation(() => {
  return [
    { repository: { name: 'repo1', full_name: 'testOrg/repo1', default_branch: 'main' } },
    { repository: { name: 'repo2', full_name: 'testOrg/repo2', default_branch: 'main' } }
  ];
});
const getBranch = jest.fn().mockImplementation(({ repo }) => {
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
const getTree = jest.fn().mockImplementation(({ repo }) => {
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
const getContent = jest.fn().mockImplementation(({ repo, path }) => {
  if (repo === 'repo1' && path === 'package.json') {
    return Promise.resolve({
      data: {
        encoding: 'base64',
        type: 'file',
        content: Buffer.from(JSON.stringify({
          dependencies: {
            '@scope/some-package': '^1.0.0'
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
const readFile = jest.fn().mockImplementation((path) => {
  if (path.toString().endsWith('cache.json')) {
    return Promise.resolve(JSON.stringify({
      'testOrg/repoCached': { data: { dependsOn: true }, updatedAt: new Date().toISOString() },
      'testOrg/repoCachedExpired': { data: { dependsOn: true }, updatedAt: new Date(0).toISOString() } // very old date to simulate expiration
    }));
  }
  return Promise.resolve('File content');
});
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
        code: jest.fn()
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
  resolve,
} from 'node:path';
import {
  setUpClientAndServerForTesting,
} from '@ama-mcp/core';
import {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  registerGetRepositoriesUsingLibraryTool,
} from './index';

const setUpClientAndServer = async (options: { disableCache?: boolean } = {}) => {
  const { disableCache = false } = options;
  const mcpServer = new McpServer({
    name: 'test-find-repositories-using-library-server',
    version: '1.0.0'
  });
  registerGetRepositoriesUsingLibraryTool(mcpServer, {
    githubToken: 'fakeToken',
    scopes: ['ama-mcp', 'scope'],
    libraryName: 'TestAmaMcpLibrary',
    disableCache,
    cacheFilePath: resolve(tmpdir(), 'cache.json')
  });
  return setUpClientAndServerForTesting(mcpServer);
};

describe('Find repositories using library', () => {
  it('should have registered the tool', async () => {
    const { client } = await setUpClientAndServer();
    const { tools } = await client.listTools();
    expect(tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'get_repositories_using_testamamcplibrary' })
    ]));
  });

  it('without cache', async () => {
    const { client } = await setUpClientAndServer({
      disableCache: true
    });
    const response = await client.callTool({ name: 'get_repositories_using_testamamcplibrary' });
    expect(response.content).toEqual([{
      type: 'text',
      text: 'The following repositories use TestAmaMcpLibrary dependencies:\n- testOrg/repo1'
    }]);
    expect(response.structuredContent).toEqual(expect.objectContaining({
      repositories: [
        'testOrg/repo1'
      ]
    }));
  });

  it('with cache', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'get_repositories_using_testamamcplibrary' });
    expect(writeFile).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/cache\.json$/),
      expect.stringContaining('testOrg/repo1')
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/cache\.json$/),
      expect.stringContaining('testOrg/repo2')
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/cache\.json$/),
      expect.stringContaining('testOrg/repoCached')
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/cache\.json$/),
      expect.not.stringContaining('testOrg/repoCachedExpired')
    );
    expect(response.content).toEqual([{
      type: 'text',
      text: 'The following repositories use TestAmaMcpLibrary dependencies:\n- testOrg/repo1\n- testOrg/repoCached'
    }]);
    expect(response.structuredContent).toEqual(expect.objectContaining({
      repositories: [
        'testOrg/repo1',
        'testOrg/repoCached'
      ]
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
