import {
  readFile,
} from 'node:fs/promises';
import {
  join,
} from 'node:path';
import {
  AmaMcpServer,
  CacheManager,
  type CacheToolOptions,
  type MCPLogger,
  resourceRegistry,
} from '@ama-mcp/core';
import {
  sendGenAIEventMetricsIfAuthorized,
} from '@o3r/telemetry';
import {
  type CssMetadata,
  loadMetadata,
} from '../helpers/load-metadata';
import {
  registerFindDesignTokenTool,
} from '../tools/find-design-token';
import {
  registerListDesignTokensTool,
} from '../tools/list-design-tokens';

/** URI prefix for design-token resources */
const RESOURCE_URI_PREFIX = 'ama-styling';

/** Cache key for the metadata */
const METADATA_CACHE_KEY = 'metadata';

/**
 * Options for the styling MCP server
 */
export interface StylingMcpServerOptions extends CacheToolOptions {
  /** Path to the styling.metadata.json file */
  metadataPath: string;
}

/**
 * Create a Design Tokens MCP server instance.
 * The server starts immediately and registers tools. Metadata is loaded
 * asynchronously in the background (and cached) so the server is responsive
 * as soon as possible. Tools await the metadata promise when called.
 * @param options Server options
 * @param logger Logger instance
 */
export async function createStylingMcpServer(
  options: StylingMcpServerOptions,
  logger: MCPLogger
): Promise<AmaMcpServer> {
  const { metadataPath, ...cacheOptions } = options;
  const { name, version } = JSON.parse(
    await readFile(join(__dirname, '..', 'package.json'), 'utf8')
  ) as { name: string; version: string };

  const server = new AmaMcpServer(
    logger,
    { name, version }
  );

  void sendGenAIEventMetricsIfAuthorized(name, 'registrationStart', { logger });

  // Initialize cache
  const cacheManager = new CacheManager<CssMetadata>({
    logger,
    ...cacheOptions
  });
  await cacheManager.initialize();

  // Mutable metadata reference — starts with cached data, updated after fresh load
  let currentMetadata = cacheManager.get(METADATA_CACHE_KEY);
  if (currentMetadata) {
    resourceRegistry.set(
      `${RESOURCE_URI_PREFIX}://metadata`,
      JSON.stringify(currentMetadata, null, 2)
    );
    logger.info?.('Restored metadata from cache');
  }

  // Load fresh metadata asynchronously and update the mutable reference
  const metadataPromise = (async () => {
    try {
      const metadata = await loadMetadata(metadataPath);
      currentMetadata = metadata;
      resourceRegistry.set(
        `${RESOURCE_URI_PREFIX}://metadata`,
        JSON.stringify(metadata, null, 2)
      );
      void cacheManager.set(METADATA_CACHE_KEY, metadata);
      logger.info?.('Design token metadata loaded successfully');
      return metadata;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error?.(`Failed to load metadata: ${message}`);
      if (currentMetadata) {
        return currentMetadata;
      }
      throw error;
    }
  })();

  // Async getter: returns current data if available, otherwise awaits loading
  const getMetadata = (): Promise<CssMetadata> => {
    if (currentMetadata) {
      return Promise.resolve(currentMetadata);
    }
    return metadataPromise;
  };

  // Register tools immediately — they await getMetadata() on each call
  registerListDesignTokensTool(server, {
    getMetadata,
    uriPrefix: RESOURCE_URI_PREFIX,
    logger
  });

  registerFindDesignTokenTool(server, {
    getMetadata,
    logger
  });

  void sendGenAIEventMetricsIfAuthorized(name, 'registrationEnd', { logger });

  return server;
}
