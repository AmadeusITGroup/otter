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
import type {
  TokenRecommendation,
} from '../tools/find-design-token';
import {
  createStylingMcpServer,
} from './mcp-server';

const { readFileMock } = vi.hoisted(() => ({
  readFileMock: vi.fn()
}));

vi.mock('node:fs/promises', () => ({
  readFile: readFileMock,
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@o3r/telemetry', () => ({
  sendGenAIEventMetricsIfAuthorized: vi.fn(),
  createGenAICallbackWithMetrics: vi.fn().mockImplementation((fn: (...args: any[]) => any) => fn)
}));

const testMetadata = {
  variables: {
    '--color-primary': {
      name: '--color-primary',
      defaultValue: '#007bff',
      type: 'color',
      category: 'brand',
      tags: ['primary', 'brand'],
      description: 'Primary brand color'
    },
    '--color-secondary': {
      name: '--color-secondary',
      defaultValue: '#6c757d',
      type: 'color',
      category: 'brand',
      tags: ['secondary'],
      description: 'Secondary brand color'
    },
    '--color-error': {
      name: '--color-error',
      defaultValue: '#dc3545',
      type: 'color',
      category: 'feedback',
      tags: ['error', 'danger'],
      description: 'Error state color'
    },
    '--spacing-sm': {
      name: '--spacing-sm',
      defaultValue: '4px',
      type: 'string',
      category: 'spacing',
      tags: ['spacing', 'small'],
      description: 'Small spacing value'
    },
    '--font-size-base': {
      name: '--font-size-base',
      defaultValue: '16px',
      type: 'string',
      category: 'typography',
      tags: ['font', 'base'],
      description: 'Base font size'
    }
  }
};

const setUpClientAndServer = async () => {
  readFileMock.mockImplementation((path: string) => {
    if (path.toString().endsWith('package.json')) {
      return Promise.resolve(JSON.stringify({ name: '@ama-styling/mcp', version: '1.0.0' }));
    }
    if (path.toString().endsWith('styling.metadata.json')) {
      return Promise.resolve(JSON.stringify(testMetadata));
    }
    // Cache file doesn't exist yet
    return Promise.reject(new Error(`ENOENT: no such file: ${path}`));
  });

  const logger = new MCPLogger('@ama-styling/mcp', 'silent');
  const mcpServer = await createStylingMcpServer(
    {
      metadataPath: '/fake/path/styling.metadata.json',
      disableCache: true
    },
    logger
  );
  return setUpClientAndServerForTesting(mcpServer);
};

interface TextContent {
  type: 'text';
  text: string;
}

interface TokenResult {
  name: string;
  defaultValue: string;
  description?: string;
  type?: string;
  category?: string;
  tags?: string[];
}

describe('createStylingMcpServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should list all tokens with list_design_tokens', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({ name: 'list_design_tokens', arguments: {} });

    expect(response.content).toHaveLength(1);
    const content = response.content[0] as TextContent;
    expect(content.type).toBe('text');

    const tokens = JSON.parse(content.text) as TokenResult[];
    expect(tokens).toHaveLength(5);
  });

  it('should find design tokens with find_design_token', async () => {
    const { client } = await setUpClientAndServer();
    const response = await client.callTool({
      name: 'find_design_token',
      arguments: { cssProperty: 'background-color', context: 'primary' }
    });

    expect(response.content).toHaveLength(1);
    const content = response.content[0] as TextContent;
    expect(content.type).toBe('text');

    const recommendations = JSON.parse(content.text) as TokenRecommendation[];
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].name).toContain('primary');
  });

  it('should include ama-styling://metadata in listed resources', async () => {
    const { client } = await setUpClientAndServer();
    const { resources } = await client.listResources();

    expect(resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ uri: 'ama-styling://metadata' })
    ]));
  });
});
