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
} from '@modelcontextprotocol/server';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  registerMetadataPerRelease,
} from './index';

vi.mock('node:fs/promises', async (importOriginal) => {
  const orig = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...orig,
    mkdir: vi.fn(),
    readFile: vi.fn().mockImplementation((path) => {
      return path.endsWith('cache.json')
        ? JSON.stringify({})
        : JSON.stringify([{ content: 'fake' }]);
    }),
    rm: vi.fn()
  };
});
vi.mock('node:stream/promises', async (importOriginal) => {
  const orig = await importOriginal<typeof import('node:stream/promises')>();
  return {
    ...orig,
    pipeline: vi.fn()
  };
});
vi.mock('node:fs', async (importOriginal) => {
  const orig = await importOriginal<typeof import('node:fs')>();
  return {
    ...orig,
    createWriteStream: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true)
  };
});
vi.mock('globby', () => ({
  sync: vi.fn().mockReturnValue(['component.config.metadata.json'])
}));
vi.mock('compressing', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('compressing')>();
  return {
    ...actualModule,
    tgz: {
      ...actualModule.tgz,
      uncompress: vi.fn().mockImplementation(() => {})
    }
  };
});

const fetchPackageArtifact = vi.fn().mockImplementation(() => {
  const body = new ReadableStream();
  const response = new Response(body, { status: 200, statusText: 'OK' });

  const result = Promise.resolve(response);
  return result;
});
const retrievePackages = vi.fn().mockReturnValue(['app1', 'app2']);
const retrieveTags = vi.fn().mockReturnValue(['v1.0', 'v2.0']);

const setUpClientAndServer = async (options: { disableCache?: boolean } = {}) => {
  const { disableCache = false } = options;
  const mcpServer = new McpServer({
    name: 'test-metadata',
    version: '1.0.0'
  });
  await registerMetadataPerRelease(mcpServer, {
    fetchPackageArtifact,
    retrievePackages,
    retrieveTags,
    disableCache,
    uriPrefix: 'prefix',
    cacheFilePath: resolve(tmpdir(), 'cache.json')
  });
  return setUpClientAndServerForTesting(mcpServer);
};

describe('Metadata per release', () => {
  it('should have registered the tool', async () => {
    const { client } = await setUpClientAndServer();
    const { tools } = await client.listTools();
    expect(tools).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'metadata_per_release_tool' })
    ]));
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates).toEqual(expect.arrayContaining([
      expect.objectContaining({ uriTemplate: 'prefix://metadata/{packageName}/{tagName}/{metadataType}' })
    ]));
  });

  it('should return the requested metadata', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'metadata_per_release_tool', arguments: {
      packageName: 'app1',
      tagName: 'v1.0',
      metadataType: 'configuration'
    } });
    expect(response.content).toEqual([
      expect.objectContaining({ type: 'text', text: JSON.stringify([{ content: 'fake' }], null, 2) }),
      expect.objectContaining({ type: 'resource_link', name: 'Metadata for app1 v1.0 configuration', uri: 'prefix://metadata/app1/v1.0/configuration' })
    ]);
  });

  it('should return the requested metadata even if packageName and tagName are not exactly matching', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'metadata_per_release_tool', arguments: {
      packageName: '@scope/app1',
      tagName: '1',
      metadataType: 'configuration'
    } });
    expect(response.content).toEqual([
      expect.objectContaining({ type: 'text', text: JSON.stringify([{ content: 'fake' }], null, 2) }),
      expect.objectContaining({ type: 'resource_link', name: 'Metadata for app1 v1.0 configuration', uri: 'prefix://metadata/app1/v1.0/configuration' })
    ]);
  });

  it('should return that no metadata has been found', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'metadata_per_release_tool', arguments: {
      packageName: 'unknown',
      tagName: 'v1.0',
      metadataType: 'configuration'
    } });
    expect(response.content).toEqual([
      expect.objectContaining({ type: 'text', text: 'Metadata not found for packageName=unknown, tagName=v1.0, metadataType=configuration' })
    ]);
  });

  it('should retrieve the resource', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.readResource({ uri: 'prefix://metadata/app1/v1.0/configuration' });
    expect(response).toEqual({
      contents: [
        { mimeType: 'application/json', text: JSON.stringify([{ content: 'fake' }], null, 2), uri: 'prefix://metadata/app1/v1.0/configuration' }
      ]
    });
  });
});
