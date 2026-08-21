import type {
  ToolDefinition,
} from '@ama-mcp/core';
import type {
  McpServer,
} from '@modelcontextprotocol/server';
import {
  z,
} from 'zod';
import type {
  CssMetadata,
  CssVariable,
} from '../helpers/load-metadata';

/** CSS properties that typically accept color values */
export const COLOR_CSS_PROPERTIES = [
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'text-decoration-color',
  'fill',
  'stroke',
  'background',
  'border'
];

/**
 * Result of a design token recommendation
 */
export interface TokenRecommendation {
  /** Token name */
  name: string;
  /** Token default value */
  defaultValue: string;
  /** Token description */
  description?: string;
  /** Token type */
  type?: string;
  /** Relevance score */
  score: number;
  /** Explanation of why this token was recommended */
  reason: string;
}

/**
 * Tokenize a string into lowercase words by splitting on spaces and punctuation.
 * @param text Input text
 * @returns Array of lowercase word tokens
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\-_.,;:!?/\\()[\]{}]+/)
    .filter((word) => word.length > 0);
}

/**
 * Result of a scoring function
 */
export interface ScoringResult {
  /** Score contribution (positive or negative) */
  score: number;
  /** Human-readable reasons for the score */
  reasons: string[];
}

/**
 * Compute type compatibility score between a CSS property and a token.
 * @param cssProperty The CSS property being styled
 * @param tokenType The token's type field
 * @returns Score adjustment and reasons
 */
export function scoreTypeCompatibility(
  cssProperty: string,
  tokenType?: string
): ScoringResult {
  const isColorProperty = COLOR_CSS_PROPERTIES.includes(cssProperty.toLowerCase());

  if (isColorProperty && tokenType === 'color') {
    return { score: 3, reasons: ['color type matches color CSS property'] };
  }
  if (isColorProperty && tokenType && tokenType !== 'color') {
    return { score: -1, reasons: [] };
  }
  if (!isColorProperty && tokenType === 'color') {
    return { score: -1, reasons: [] };
  }
  return { score: 0, reasons: [] };
}

/**
 * Score name match between context words and token name segments.
 * @param tokenName The token name (e.g., "--color-primary")
 * @param contextWords Tokenized context words
 * @returns Score and reasons
 */
export function scoreNameMatch(
  tokenName: string,
  contextWords: string[]
): ScoringResult {
  let score = 0;
  const reasons: string[] = [];
  const tokenNameParts = tokenName.toLowerCase().split('-').filter((part) => part.length > 0);

  for (const word of contextWords) {
    if (tokenNameParts.includes(word)) {
      score += 2;
      reasons.push(`name contains "${word}"`);
    }
  }
  return { score, reasons };
}

/**
 * Score description and label match.
 * @param description Token description
 * @param label Token label
 * @param contextWords Tokenized context words
 * @returns Score and reasons
 */
export function scoreDescriptionMatch(
  description: string | undefined,
  label: string | undefined,
  contextWords: string[]
): ScoringResult {
  let score = 0;
  const reasons: string[] = [];
  const descriptionWords = tokenize(description || '');
  const labelWords = tokenize(label || '');

  for (const word of contextWords) {
    if (descriptionWords.includes(word)) {
      score += 1;
      reasons.push(`description contains "${word}"`);
    }
    if (labelWords.includes(word)) {
      score += 1;
      reasons.push(`label contains "${word}"`);
    }
  }
  return { score, reasons };
}

/**
 * Score tag match.
 * @param tags Token tags
 * @param contextWords Tokenized context words
 * @returns Score and reasons
 */
export function scoreTagMatch(
  tags: string[] | undefined,
  contextWords: string[]
): ScoringResult {
  let score = 0;
  const reasons: string[] = [];

  if (tags) {
    for (const word of contextWords) {
      if (tags.some((tag) => tag.toLowerCase() === word)) {
        score += 1.5;
        reasons.push(`tag matches "${word}"`);
      }
    }
  }
  return { score, reasons };
}

/**
 * Score category match.
 * @param category Token category
 * @param contextWords Tokenized context words
 * @returns Score and reasons
 */
export function scoreCategoryMatch(
  category: string | undefined,
  contextWords: string[]
): ScoringResult {
  let score = 0;
  const reasons: string[] = [];

  if (category) {
    const categoryLower = category.toLowerCase();
    for (const word of contextWords) {
      if (categoryLower === word || categoryLower.includes(word)) {
        score += 1.5;
        reasons.push(`category matches "${word}"`);
      }
    }
  }
  return { score, reasons };
}

/**
 * Score a token against the given CSS property and semantic context.
 * @param token The design token to score
 * @param cssProperty The CSS property being styled
 * @param contextWords Tokenized context words
 * @returns Object with total score and reasons
 */
export function scoreToken(
  token: CssVariable,
  cssProperty: string,
  contextWords: string[]
): ScoringResult {
  const results = [
    () => scoreTypeCompatibility(cssProperty, token.type),
    () => scoreNameMatch(token.name, contextWords),
    () => scoreDescriptionMatch(token.description, token.label, contextWords),
    () => scoreTagMatch(token.tags, contextWords),
    () => scoreCategoryMatch(token.category, contextWords)
  ] satisfies (() => ScoringResult)[];

  return results.map((fn) => fn()).reduce<ScoringResult>(
    (acc, result) => {
      acc.score += result.score;
      acc.reasons.push(...result.reasons);
      return acc;
    },
    { score: 0, reasons: [] }
  );
}

/**
 * Options for the find design token tool
 * @experimental
 */
export interface FindDesignTokenOptions extends ToolDefinition {
  /** Async getter that returns the metadata (awaits loading if not yet available) */
  getMetadata: () => Promise<CssMetadata>;
}

/**
 * Register the find_design_token tool on the MCP server.
 * @param server MCP server instance
 * @param options Tool options
 */
export function registerFindDesignTokenTool(server: McpServer, options: FindDesignTokenOptions): void {
  const {
    getMetadata,
    toolName = 'find_design_token',
    toolTitle = 'Find Design Token',
    toolDescription = 'Given a CSS property and semantic context, recommends the best matching'
      + ' design tokens to use instead of hardcoded values.'
  } = options;

  server.registerTool(
    toolName,
    {
      title: toolTitle,
      description: toolDescription,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      },
      inputSchema: z.object({
        cssProperty: z.string()
          .describe('The CSS property (e.g., "background-color", "font-size", "border-radius")'),
        context: z.string()
          .describe('Semantic context describing the use case (e.g., "primary button background")'),
        maxResults: z.number().optional().default(5)
          .describe('Maximum number of recommendations to return')
      })
    },
    async ({ cssProperty, context, maxResults }) => {
      const metadata = await getMetadata();

      const contextWords = tokenize(context);
      const tokens = Object.values(metadata.variables);

      const scored: TokenRecommendation[] = tokens
        .map((token) => {
          const { score, reasons } = scoreToken(token, cssProperty, contextWords);
          return {
            name: token.name,
            defaultValue: token.defaultValue,
            description: token.description,
            type: token.type,
            score,
            reason: reasons.length > 0 ? reasons.join(', ') : 'no specific match'
          };
        })
        .filter((item) => item.score > 0)
        .toSorted((a, b) => b.score - a.score)
        .slice(0, maxResults);

      if (scored.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                message: `No matching design tokens found for CSS property "${cssProperty}"`
                  + ` with context "${context}". Consider checking available tokens`
                  + ' with list_design_tokens.',
                suggestions: [
                  'Try broader context terms',
                  'Use list_design_tokens to see all available tokens',
                  'Check if the design system has tokens for this property type'
                ]
              }, null, 2)
            }
          ]
        };
      }

      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(scored, null, 2) }
        ]
      };
    }
  );
}
