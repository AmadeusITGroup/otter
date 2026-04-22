import {
  existsSync,
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  AmaMcpServer,
  type Logger,
  MCPLogger,
  resourceRegistry,
  type ResourceToolOptions,
  type ToolDefinition,
} from '@ama-mcp/core';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  sendGenAIEventMetricsIfAuthorized,
} from '@o3r/telemetry';
import {
  z,
} from 'zod';
import {
  loadSdkContexts,
  type SdkContextInfo,
} from '../helpers/context';
import {
  isValidPackageName,
  loadSdkPackagesFromPackageJson,
} from '../helpers/utils';

/** Filename for SDK context documentation */
const SDK_CONTEXT_FILENAME = 'SDK_CONTEXT.md';

/** Filename for SDK usage instructions */
const INSTRUCTIONS_FILENAME = 'INSTRUCTIONS.md';

/** URI for the instructions resource */
const INSTRUCTIONS_URI = 'sdk-context://instructions';

/**
 * Options for SDK context registration
 */
export interface SdkContextOptions extends Partial<ResourceToolOptions>, ToolDefinition {
  /**
   * Path to project root where package.json is located
   * @default '.'
   */
  projectPath?: string;
  /**
   * Explicit list of SDK packages (overrides package.json sdkContext.packages)
   */
  sdkPackages?: string[];
}

/**
 * Type of the response from the SDK context retriever tool
 */
export type SdkContextResponse = {
  content: ({ type: 'text'; text: string }
    | { type: 'resource_link'; name: string; uri: string })[];
};

/**
 * Register a single SDK context as a resource
 * @param server MCP server instance
 * @param ctx SDK context info
 */
const registerSingleResource = (server: McpServer, ctx: SdkContextInfo): void => {
  resourceRegistry.set(ctx.uri, ctx.content);
  server.registerResource(
    `SDK Context: ${ctx.packageName}`,
    ctx.uri,
    {
      title: `SDK Context for ${ctx.packageName}`,
      description: `API structure and domain information for ${ctx.packageName}.
      Use this to avoid hallucinations when implementing features with this SDK.`,
      mimeType: 'text/markdown'
    },
    () => ({ contents: [{ uri: ctx.uri, text: ctx.content }] })
  );
};

/**
 * Factory that creates a retriever for SDK context information
 * @param contexts Loaded SDK contexts
 * @param logger Logger instance
 * @returns Retriever that fetches SDK context by package name
 */
const sdkContextRetriever = (
  contexts: SdkContextInfo[],
  logger: Logger
) => ({ packageName }: { packageName: string }): SdkContextResponse => {
  if (!isValidPackageName(packageName)) {
    logger.warn?.(`Invalid package name requested: "${packageName}"`);
    return {
      content: [
        { type: 'text' as const, text: `Invalid package name: "${packageName}". Package names must follow npm naming conventions.` }
      ]
    };
  }

  const ctx = contexts.find((c) => c.packageName === packageName);
  if (ctx) {
    return {
      content: [
        { type: 'text' as const, text: ctx.content },
        { type: 'resource_link' as const, name: `SDK Context: ${ctx.packageName}`, uri: ctx.uri }
      ]
    };
  }
  return {
    content: [
      {
        type: 'text' as const,
        text: `No SDK_CONTEXT.md found for package "${packageName}". Check that:\n
          1. The package is listed in package.json sdkContext.packages or provided via CLI args\n
          2. The package has SDK_CONTEXT.md generated`
      }
    ]
  };
};

/**
 * Register the SDK context tool on the server
 * @param server MCP server instance
 * @param contexts Loaded SDK contexts
 * @param logger Logger instance
 * @param toolOptions Tool definition options
 */
const registerTool = (
  server: McpServer,
  contexts: SdkContextInfo[],
  logger: Logger,
  toolOptions: ToolDefinition
): void => {
  const {
    toolName = 'get_sdk_context',
    toolTitle = 'Get SDK Context',
    toolDescription = `Retrieve SDK context information for configured SDK packages to understand their
      API structure, available operations, and models. Use this before implementing features that rely on
      an SDK to avoid hallucinations.`
  } = toolOptions;

  logger.info?.(`Registering SDK context tool with ${contexts.length} contexts`);

  server.registerTool(
    toolName,
    {
      title: toolTitle,
      description: toolDescription,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false
      },
      inputSchema: {
        packageName: z.string()
          .describe('The npm package name of the SDK (e.g., "@my-scope/my-sdk-package")')
      }
    },
    sdkContextRetriever(contexts, logger)
  );
};

/**
 * Register both SDK context resources and tool
 * @param server MCP server instance
 * @param options Configuration options
 */
export const registerSdkContextToolAndResources = (
  server: McpServer,
  options: SdkContextOptions = {}
): void => {
  const projectPath = options.projectPath ?? '.';
  const logger = options.logger || new MCPLogger('@ama-mcp/sdk');
  const sdkPackages = options.sdkPackages ?? loadSdkPackagesFromPackageJson(projectPath, logger);
  const contexts = loadSdkContexts(sdkPackages, SDK_CONTEXT_FILENAME, logger);

  // Register resources
  logger.info?.(`Registering ${contexts.length} SDK context resources`);
  contexts.forEach((ctx) => registerSingleResource(server, ctx));

  // Register tool
  registerTool(server, contexts, logger, options);

  // Register instructions
  registerInstructionsResource(server, logger);
};

/**
 * Load the instructions content from the bundled INSTRUCTIONS.md file
 * @param logger Optional logger for debug output
 * @returns The instructions content or null if not found
 */
const loadInstructionsContent = (logger?: Logger): string | null => {
  try {
    // Resolve the path relative to this module's location (dist/src/index.js -> dist/resources/INSTRUCTIONS.md)
    const instructionsPath = resolve(__dirname, '..', '..', 'resources', INSTRUCTIONS_FILENAME);

    if (!existsSync(instructionsPath)) {
      logger?.debug?.(`Instructions file not found at ${instructionsPath}`);
      return null;
    }

    return readFileSync(instructionsPath, 'utf8');
  } catch (error) {
    logger?.error?.('Failed to load instructions:', error);
    return null;
  }
};

/**
 * Register the SDK context usage instructions as an MCP resource
 * @param server MCP server instance
 * @param logger Optional logger for debug output
 */
const registerInstructionsResource = (
  server: McpServer,
  logger?: Logger
): void => {
  const content = loadInstructionsContent(logger);

  if (!content) {
    logger?.warn?.('Could not load SDK context instructions');
    return;
  }

  resourceRegistry.set(INSTRUCTIONS_URI, content);
  server.registerResource(
    'SDK Context Instructions',
    INSTRUCTIONS_URI,
    {
      title: 'SDK Context Usage Instructions',
      description: `Guidelines for using SDK context to avoid hallucinations when implementing features with installed SDKs.
        Read this before using the get_sdk_context tool.`,
      mimeType: 'text/markdown'
    },
    () => ({ contents: [{ uri: INSTRUCTIONS_URI, text: content }] })
  );

  logger?.info?.('Registered SDK context instructions resource');
};

/**
 * Create and configure an SDK Context MCP server
 * @param options Configuration options for the server
 * @returns Configured AmaMcpServer instance with SDK context tools and resources registered
 */
export const createSdkContextServer = (options: SdkContextOptions = {}): AmaMcpServer => {
  const name = '@ama-mcp/sdk';
  const logger = options.logger ?? new MCPLogger(name, options.logLevel);
  const server = new AmaMcpServer(
    logger,
    {
      name,
      version: '0.0.0'
    }
  );

  void sendGenAIEventMetricsIfAuthorized(name, 'registrationStart', { logger });

  registerSdkContextToolAndResources(server, { ...options, logger });

  void sendGenAIEventMetricsIfAuthorized(name, 'registrationEnd', { logger });

  return server;
};
