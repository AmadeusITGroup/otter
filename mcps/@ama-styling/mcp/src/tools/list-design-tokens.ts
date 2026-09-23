import {
  resourceRegistry,
  type ResourceToolOptions,
  type ToolDefinition,
} from '@ama-mcp/core';
import type {
  McpServer,
} from '@modelcontextprotocol/server';
import {
  z,
} from 'zod';
import type {
  CssMetadata,
} from '../helpers/load-metadata';
import {
  validateRegexSafety,
} from '../helpers/safe-regex';

/**
 * Options for the list design tokens tool
 * @experimental
 */
export interface ListDesignTokensOptions extends ToolDefinition, ResourceToolOptions {
  /** Async getter that returns the metadata (awaits loading if not yet available) */
  getMetadata: () => Promise<CssMetadata>;
}

/**
 * Register the list_design_tokens tool and the metadata resource.
 * @param server MCP server instance
 * @param options Tool options
 */
export function registerListDesignTokensTool(server: McpServer, options: ListDesignTokensOptions): void {
  const {
    getMetadata,
    logger,
    uriPrefix,
    toolName = 'list_design_tokens',
    toolTitle = 'List Design Tokens',
    toolDescription = 'List available design tokens with their descriptions, values, types,'
      + ' categories, and tags. Supports optional filtering.'
  } = options;

  const metadataUri = `${uriPrefix}://metadata`;

  server.registerResource(
    'Design Tokens Metadata',
    metadataUri,
    {
      title: 'Design Tokens Metadata',
      description: 'Full design token metadata including all variables,'
        + ' their values, types, categories, and tags.',
      mimeType: 'application/json'
    },
    () => {
      const content = resourceRegistry.get(metadataUri);
      return {
        contents: [{
          uri: metadataUri,
          text: content ?? JSON.stringify({ variables: {} })
        }]
      };
    }
  );

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
        category: z.string().optional()
          .describe('Filter tokens by category'),
        tag: z.string().optional()
          .describe('Filter tokens by tag'),
        type: z.enum(['color', 'string']).optional()
          .describe('Filter tokens by type'),
        namePattern: z.string().optional()
          .describe('Filter tokens by name pattern (regex)')
      })
    },
    async ({ category, tag, type, namePattern }) => {
      const metadata = await getMetadata();
      const warnings: string[] = [];

      let tokens = Object.values(metadata.variables);

      if (category) {
        tokens = tokens.filter((token) => token.category === category);
      }

      if (tag) {
        tokens = tokens.filter((token) => token.tags?.includes(tag));
      }

      if (type) {
        tokens = tokens.filter((token) => token.type === type);
      }

      if (namePattern) {
        const safetyCheck = validateRegexSafety(namePattern);
        if (safetyCheck.safe) {
          try {
            const regex = new RegExp(namePattern);
            tokens = tokens.filter((token) => regex.test(token.name));
          } catch (error) {
            const warning = `Invalid regex pattern "${namePattern}": ${error instanceof Error ? error.message : String(error)}. `
              + 'Returning tokens without name filtering. Please provide a valid regular expression.';
            logger?.warn?.(warning);
            warnings.push(warning);
          }
        } else {
          const warning = `Unsafe regex pattern ignored: ${safetyCheck.error}. `
            + 'Returning tokens without name filtering. Please simplify the pattern.';
          logger?.warn?.(warning);
          warnings.push(warning);
        }
      }

      const result = warnings.length > 0
        ? { warnings, tokens }
        : { tokens };

      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(result) }
        ]
      };
    }
  );
}
