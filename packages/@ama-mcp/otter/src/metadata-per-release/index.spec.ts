/* eslint-disable import/first -- Need to mock before import */
jest.mock('node:fs/promises', () => ({
  ...jest.requireActual('node:fs'),
  mkdir: jest.fn(),
  readFile: jest.fn().mockReturnValue(JSON.stringify([{ content: 'fake' }])),
  rm: jest.fn()
}));
jest.mock('node:stream/promises', () => ({
  ...jest.requireActual('node:stream/promises'),
  pipeline: jest.fn()
}));
jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  createWriteStream: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true)
}));
jest.mock('globby', () => ({
  sync: jest.fn().mockReturnValue(['component.config.metadata.json'])
}));
jest.mock('compressing', () => {
  const actualModule = jest.requireActual('compressing');
  return {
    ...actualModule,
    tgz: {
      ...actualModule.tgz,
      uncompress: jest.fn().mockImplementation(() => {})
    }
  };
});

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
  registerMetadataPerRelease,
} from './index';

const fetchPackageArtifact = jest.fn().mockImplementation(() => {
  const body = new ReadableStream();
  const response = new Response(body, { status: 200, statusText: 'OK' });

  const result = Promise.resolve(response);
  return result;
});
const retrievePackages = jest.fn().mockReturnValue(['app1', 'app2']);
const retrieveTags = jest.fn().mockReturnValue(['v1.0', 'v2.0']);

const setUpClientAndServer = async (options: { disableCache?: boolean } = {}) => {
  const { disableCache = false } = options;
  const mcpServer = new McpServer({
    name: 'test-metadata',
    version: '1.0.0',
    capabilities: {
      tools: {}
    }
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
