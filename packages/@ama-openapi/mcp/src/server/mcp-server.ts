import {
  AmaMcpServer,
  type Logger,
} from '@ama-mcp/core';
import {
  MCPLogger,
} from '@ama-mcp/core';
import type {
  McpServer,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {
  Implementation,
} from '@modelcontextprotocol/sdk/types';

/**
 * Options for the OpenAPI MCP server
 */
export interface OpenApiMcpServerOptions extends Partial<Pick<Implementation, 'name' | 'version'>> {
  /**
   * Logger instance
   */
  logger?: Logger;
}

/**
 * Creates the OpenAPI MCP server instance
 * @param options Server options
 * @returns The configured MCP server
 */
export const createOpenApiMcpServer = async (options: OpenApiMcpServerOptions): Promise<McpServer> => {
  const { name = 'ama-openapi-mcp', version = '0.0.0-placeholder' } = options;
  const { logger = new MCPLogger(name) } = options;

  const server = new AmaMcpServer(logger, { name, version });

  // Register tools
  (await import('./tools/create-project/create-project.js')).createProject(server);
  (await import('./tools/add-dependency-model/add-dependency-model.js')).addDependencyModel(server);
  (await import('./tools/rename-model/rename-model.js')).renameModel(server);
  (await import('./tools/create-mask/create-mask.js')).createMask(server);

  return server;
};
