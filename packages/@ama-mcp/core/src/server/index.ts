import type {
  ServerOptions,
} from '@modelcontextprotocol/sdk/server/index.js';
import {
  McpServer,
  type ReadResourceCallback,
  type ReadResourceTemplateCallback,
  type RegisteredResource,
  type RegisteredResourceTemplate,
  type ResourceMetadata,
  type ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {
  Implementation,
} from '@modelcontextprotocol/sdk/types';
import type {
  createGenAICallbackWithMetrics,
} from '@o3r/telemetry';
import type {
  Logger,
} from '../logger';

const createCallback = <T extends (...args: any[]) => any>(...args: Parameters<typeof createGenAICallbackWithMetrics>) => async (...callbackArgs: Parameters<T>) => {
  const { createGenAICallbackWithMetrics } = await import('@o3r/telemetry');
  const wrappedCallback = createGenAICallbackWithMetrics(...args);
  return wrappedCallback(...callbackArgs);
};

/**
 * MCP server with telemetry support
 */
export class AmaMcpServer extends McpServer {
  constructor(private readonly logger: Logger, serverInfo: Implementation, options?: ServerOptions) {
    super(serverInfo, options);
  }

  /**
   * @inheritdoc
   */
  public override registerPrompt(...args: Parameters<typeof McpServer.prototype.registerPrompt>) {
    const [name, config, promptCallback] = args;
    const callback = createCallback(promptCallback, name, 'promptCall', { logger: this.logger });
    let error: any;
    let result;
    try {
      result = super.registerPrompt(name, config, callback);
    } catch (e) {
      error = e;
    } finally {
      void (async () => {
        const { sendGenAIEventMetricsIfAuthorized } = await import('@o3r/telemetry');
        return sendGenAIEventMetricsIfAuthorized(name, 'promptRegistration', { logger: this.logger }, error);
      })();
    }
    if (result) {
      return result;
    }
    throw error;
  }

  /**
   * @inheritdoc
   */
  public override registerTool(...args: Parameters<typeof McpServer.prototype.registerTool>) {
    const [name, config, toolCallback] = args;
    const callback = createCallback(toolCallback, name, 'toolCall', { logger: this.logger });
    let error: any;
    let result;
    try {
      result = super.registerTool(name, config, callback);
    } catch (e) {
      error = e;
    } finally {
      void (async () => {
        const { sendGenAIEventMetricsIfAuthorized } = await import('@o3r/telemetry');
        return sendGenAIEventMetricsIfAuthorized(name, 'toolRegistration', { logger: this.logger }, error);
      })();
    }
    if (result) {
      return result;
    }
    throw error;
  }

  /**
   * @inheritdoc
   */
  public override registerResource(name: string, uriOrTemplate: string, config: ResourceMetadata, resourceCallback: ReadResourceCallback): RegisteredResource;
  /**
   * @inheritdoc
   */
  public override registerResource(name: string, uriOrTemplate: ResourceTemplate, config: ResourceMetadata, resourceCallback: ReadResourceTemplateCallback): RegisteredResourceTemplate;
  /**
   * @inheritdoc
   */
  public override registerResource(
    name: string,
    uriOrTemplate: string | ResourceTemplate,
    config: ResourceMetadata,
    resourceCallback: ReadResourceCallback | ReadResourceTemplateCallback
  ): RegisteredResourceTemplate | RegisteredResource {
    const callback = createCallback(resourceCallback, name, 'resourceCall', { logger: this.logger });
    let error: any;
    let result;
    try {
      // Cast is required because the overload typing on MCP SDK is not correct
      result = super.registerResource(name, uriOrTemplate as any, config, callback);
    } catch (e) {
      error = e;
    } finally {
      void (async () => {
        const { sendGenAIEventMetricsIfAuthorized } = await import('@o3r/telemetry');
        return sendGenAIEventMetricsIfAuthorized(name, 'resourceRegistration', { logger: this.logger }, error);
      })();
    }
    if (result) {
      return result;
    }
    throw error;
  }
}
