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
  registerFindDesignTokenTool,
  scoreCategoryMatch,
  scoreDescriptionMatch,
  scoreNameMatch,
  scoreTagMatch,
  scoreToken,
  scoreTypeCompatibility,
  tokenize,
  type TokenRecommendation,
} from './find-design-token';

describe('tokenize', () => {
  it('should split on spaces and punctuation', () => {
    expect(tokenize('primary button background')).toEqual(['primary', 'button', 'background']);
  });

  it('should handle hyphens and underscores', () => {
    expect(tokenize('primary-button_background')).toEqual(['primary', 'button', 'background']);
  });

  it('should lowercase all words', () => {
    expect(tokenize('Primary BUTTON')).toEqual(['primary', 'button']);
  });

  it('should filter empty strings', () => {
    expect(tokenize('  multiple   spaces  ')).toEqual(['multiple', 'spaces']);
  });
});

describe('scoreTypeCompatibility', () => {
  it('should boost color tokens for color CSS properties', () => {
    expect(scoreTypeCompatibility('background-color', 'color')).toEqual({
      score: 3,
      reasons: ['color type matches color CSS property']
    });
  });

  it('should penalize non-color tokens for color CSS properties', () => {
    expect(scoreTypeCompatibility('background-color', 'string')).toEqual({ score: -1, reasons: ['token type "string" does not match color CSS property'] });
  });

  it('should penalize color tokens for non-color CSS properties', () => {
    expect(scoreTypeCompatibility('font-size', 'color')).toEqual({ score: -1, reasons: ['color token does not match non-color CSS property "font-size"'] });
  });

  it('should return neutral for non-color property and non-color token', () => {
    expect(scoreTypeCompatibility('font-size', 'string')).toEqual({ score: 0, reasons: ['no type compatibility signal'] });
  });

  it('should return neutral when token type is undefined', () => {
    expect(scoreTypeCompatibility('font-size', undefined)).toEqual({ score: 0, reasons: ['no type compatibility signal'] });
  });
});

describe('scoreNameMatch', () => {
  it('should score matching name segments', () => {
    const result = scoreNameMatch('--color-primary', ['primary']);
    expect(result.score).toBe(2);
    expect(result.reasons).toContain('name contains "primary"');
  });

  it('should score multiple matching segments', () => {
    const result = scoreNameMatch('--color-primary-light', ['primary', 'light']);
    expect(result.score).toBe(4);
  });

  it('should return zero for no matches', () => {
    const result = scoreNameMatch('--spacing-sm', ['primary']);
    expect(result.score).toBe(0);
    expect(result.reasons).toHaveLength(0);
  });
});

describe('scoreDescriptionMatch', () => {
  it('should score matching description words', () => {
    const result = scoreDescriptionMatch('Primary brand color', undefined, ['primary']);
    expect(result.score).toBe(1);
    expect(result.reasons).toContain('description contains "primary"');
  });

  it('should score matching label words', () => {
    const result = scoreDescriptionMatch(undefined, 'Primary Color', ['primary']);
    expect(result.score).toBe(1);
    expect(result.reasons).toContain('label contains "primary"');
  });

  it('should score both description and label', () => {
    const result = scoreDescriptionMatch('Primary color', 'Primary variant', ['primary']);
    expect(result.score).toBe(2);
  });

  it('should handle undefined description and label', () => {
    const result = scoreDescriptionMatch(undefined, undefined, ['primary']);
    expect(result.score).toBe(0);
  });
});

describe('scoreTagMatch', () => {
  it('should score matching tags', () => {
    const result = scoreTagMatch(['primary', 'brand'], ['primary']);
    expect(result.score).toBe(1.5);
    expect(result.reasons).toContain('tag matches "primary"');
  });

  it('should score multiple matching tags', () => {
    const result = scoreTagMatch(['primary', 'brand'], ['primary', 'brand']);
    expect(result.score).toBe(3);
  });

  it('should return zero for no matching tags', () => {
    const result = scoreTagMatch(['secondary'], ['primary']);
    expect(result.score).toBe(0);
  });

  it('should handle undefined tags', () => {
    const result = scoreTagMatch(undefined, ['primary']);
    expect(result.score).toBe(0);
  });
});

describe('scoreCategoryMatch', () => {
  it('should score exact category match', () => {
    const result = scoreCategoryMatch('brand', ['brand']);
    expect(result.score).toBe(1.5);
    expect(result.reasons).toContain('category matches "brand"');
  });

  it('should score partial category match', () => {
    const result = scoreCategoryMatch('typography', ['typo']);
    expect(result.score).toBe(1.5);
  });

  it('should return zero for no match', () => {
    const result = scoreCategoryMatch('spacing', ['color']);
    expect(result.score).toBe(0);
  });

  it('should handle undefined category', () => {
    const result = scoreCategoryMatch(undefined, ['brand']);
    expect(result.score).toBe(0);
  });
});

describe('scoreToken', () => {
  const colorToken: CssVariable = {
    name: '--color-primary',
    defaultValue: '#007bff',
    type: 'color',
    category: 'brand',
    tags: ['primary', 'brand'],
    description: 'Primary brand color'
  };

  const spacingToken: CssVariable = {
    name: '--spacing-sm',
    defaultValue: '4px',
    type: 'string',
    category: 'spacing',
    tags: ['spacing', 'small'],
    description: 'Small spacing value'
  };

  it('should combine all scoring dimensions', () => {
    const result = scoreToken(colorToken, 'background-color', ['primary', 'brand']);
    // type: +3, name "primary": +2, desc "primary": +1, desc "brand": +1,
    // tag "primary": +1.5, tag "brand": +1.5, category "brand": +1.5
    expect(result.score).toBeGreaterThan(5);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should penalize color tokens for non-color properties', () => {
    const result = scoreToken(colorToken, 'font-size', ['primary']);
    const spacingResult = scoreToken(spacingToken, 'font-size', ['small']);
    // Color token gets -1 for type mismatch, spacing doesn't
    expect(spacingResult.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(spacingResult.score + 3);
  });

  it('should produce deterministic results', () => {
    const r1 = scoreToken(colorToken, 'color', ['primary']);
    const r2 = scoreToken(colorToken, 'color', ['primary']);
    expect(r1.score).toBe(r2.score);
    expect(r1.reasons).toEqual(r2.reasons);
  });
});

describe('registerFindDesignTokenTool', () => {
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

  interface ToolInput {
    cssProperty: string;
    context: string;
    maxResults?: number;
  }

  interface ToolResponse {
    content: { type: string; text: string }[];
  }

  let toolCallback: (args: ToolInput) => Promise<ToolResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    registerFindDesignTokenTool(
      mockServer as unknown as Parameters<typeof registerFindDesignTokenTool>[0],
      { getMetadata: () => Promise.resolve(testMetadata) }
    );
    toolCallback = mockServer.registerTool.mock.calls[0][2] as (args: ToolInput) => Promise<ToolResponse>;
  });

  it('should return color tokens scored highest for color CSS property + "primary"', async () => {
    const result = await toolCallback({ cssProperty: 'background-color', context: 'primary' });
    const recommendations = JSON.parse(result.content[0].text) as TokenRecommendation[];

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].name).toContain('primary');
    expect(recommendations[0].type).toBe('color');
    expect(recommendations[0].score).toBeGreaterThan(0);
  });

  it('should not prefer color tokens for non-color property', async () => {
    const result = await toolCallback({ cssProperty: 'font-size', context: 'base font' });
    const recommendations = JSON.parse(result.content[0].text) as TokenRecommendation[];

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].name).toBe('--font-size-base');
  });

  it('should return helpful message when nothing matches', async () => {
    const result = await toolCallback({ cssProperty: 'z-index', context: 'zzzznonexistent' });
    const parsed = JSON.parse(result.content[0].text) as { message: string; suggestions: string[] };

    expect(parsed.message).toContain('No matching design tokens found');
    expect(parsed.suggestions).toBeDefined();
  });

  it('should produce deterministic scoring', async () => {
    const result1 = await toolCallback({ cssProperty: 'background-color', context: 'primary brand' });
    const result2 = await toolCallback({ cssProperty: 'background-color', context: 'primary brand' });

    expect(result1.content[0].text).toBe(result2.content[0].text);
  });

  it('should limit results with maxResults parameter', async () => {
    const result = await toolCallback({ cssProperty: 'color', context: 'primary brand color', maxResults: 2 });
    const recommendations = JSON.parse(result.content[0].text) as TokenRecommendation[];

    expect(recommendations.length).toBeLessThanOrEqual(2);
  });

  it('should match context words against tags and categories', async () => {
    const result = await toolCallback({ cssProperty: 'color', context: 'error danger feedback' });
    const recommendations = JSON.parse(result.content[0].text) as TokenRecommendation[];

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].name).toBe('--color-error');
    expect(recommendations[0].reason).toContain('tag matches');
  });
});
