import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type {
  CssMetadata,
  CssVariable,
} from '../helpers/load-metadata';
import {
  registerListDesignTokensTool,
} from './list-design-tokens';

describe('registerListDesignTokensTool', () => {
  const mockServer = {
    registerTool: vi.fn(),
    registerResource: vi.fn()
  };

  const testMetadata: CssMetadata = {
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
        description: 'Secondary color'
      },
      '--spacing-sm': {
        name: '--spacing-sm',
        defaultValue: '4px',
        type: 'string',
        category: 'spacing',
        tags: ['spacing', 'small'],
        description: 'Small spacing'
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

  interface ToolInput {
    category?: string;
    tag?: string;
    type?: 'color' | 'string';
    namePattern?: string;
  }

  interface ToolResponse {
    content: { type: string; text: string }[];
  }

  type TokenResult = Pick<CssVariable, 'name' | 'defaultValue' | 'description' | 'type' | 'category' | 'tags'>;

  let toolCallback: (args: ToolInput) => Promise<ToolResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerListDesignTokensTool(
      mockServer as unknown as Parameters<typeof registerListDesignTokensTool>[0],
      { getMetadata: () => Promise.resolve(testMetadata), uriPrefix: 'ama-styling' }
    );
    toolCallback = mockServer.registerTool.mock.calls[0][2] as (args: ToolInput) => Promise<ToolResponse>;
  });

  it('should return all tokens when no filters provided', async () => {
    const result = await toolCallback({});
    const tokens = JSON.parse(result.content[0].text) as TokenResult[];

    expect(tokens).toHaveLength(4);
  });

  it('should filter by category correctly', async () => {
    const result = await toolCallback({ category: 'brand' });
    const tokens = JSON.parse(result.content[0].text) as TokenResult[];

    expect(tokens).toHaveLength(2);
    expect(tokens.every((t) => t.category === 'brand')).toBe(true);
  });

  it('should filter by tag correctly', async () => {
    const result = await toolCallback({ tag: 'primary' });
    const tokens = JSON.parse(result.content[0].text) as TokenResult[];

    expect(tokens).toHaveLength(1);
    expect(tokens[0].name).toBe('--color-primary');
  });

  it('should filter by type correctly', async () => {
    const result = await toolCallback({ type: 'color' });
    const tokens = JSON.parse(result.content[0].text) as TokenResult[];

    expect(tokens).toHaveLength(2);
    expect(tokens.every((t) => t.type === 'color')).toBe(true);
  });

  it('should filter by namePattern (regex) correctly', async () => {
    const result = await toolCallback({ namePattern: 'color' });
    const tokens = JSON.parse(result.content[0].text) as TokenResult[];

    expect(tokens).toHaveLength(2);
    expect(tokens.every((t) => t.name.includes('color'))).toBe(true);
  });

  it('should combine multiple filters (AND logic)', async () => {
    const result = await toolCallback({ type: 'color', tag: 'secondary' });
    const tokens = JSON.parse(result.content[0].text) as TokenResult[];

    expect(tokens).toHaveLength(1);
    expect(tokens[0].name).toBe('--color-secondary');
  });

  it('should return empty array when nothing matches', async () => {
    const result = await toolCallback({ category: 'nonexistent' });
    const tokens = JSON.parse(result.content[0].text) as TokenResult[];

    expect(tokens).toHaveLength(0);
  });

  it('should register the metadata resource', () => {
    expect(mockServer.registerResource).toHaveBeenCalledWith(
      'Design Tokens Metadata',
      'ama-styling://metadata',
      expect.objectContaining({
        title: 'Design Tokens Metadata',
        mimeType: 'application/json'
      }),
      expect.any(Function)
    );
  });
});
