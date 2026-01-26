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
  type ToolCallback,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {
  AnySchema,
  ZodRawShapeCompat,
} from '@modelcontextprotocol/sdk/server/zod-compat';
import type {
  Implementation,
} from '@modelcontextprotocol/sdk/types';
import type {
  createGenAICallbackWithMetrics,
  sendGenAIEventMetricsIfAuthorized,
} from '@o3r/telemetry';
import type {
  Logger,
} from '../logger';

const createCallback = <T extends (...args: any[]) => any>(...args: Parameters<typeof createGenAICallbackWithMetrics>) => async (...callbackArgs: Parameters<T>) => {
  const { createGenAICallbackWithMetrics } = await import('@o3r/telemetry');
  const wrappedCallback = createGenAICallbackWithMetrics(...args);
  return wrappedCallback(...callbackArgs);
};

const sendMetricsIfAuthorized = async (...args: Parameters<typeof sendGenAIEventMetricsIfAuthorized>) => {
  const { sendGenAIEventMetricsIfAuthorized } = await import('@o3r/telemetry');
  return sendGenAIEventMetricsIfAuthorized(...args);
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
    let error;
    try {
      return super.registerPrompt(name, config, callback);
    } catch (e) {
      error = e;
      throw e;
    } finally {
      void sendMetricsIfAuthorized(name, 'promptRegistration', { logger: this.logger }, error);
    }
  }

  /**
   * @inheritdoc
   */
  public override registerTool<OutputArgs extends ZodRawShapeCompat | AnySchema, InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined>(
    ...args: Parameters<typeof McpServer.prototype.registerTool<OutputArgs, InputArgs>>
  ) {
    const [name, config, toolCallback] = args;
    const callback = createCallback(toolCallback, name, 'toolCall', { logger: this.logger }) as ToolCallback<InputArgs>;
    let error;
    try {
      return super.registerTool(name, config, callback);
    } catch (e) {
      error = e;
      throw e;
    } finally {
      void sendMetricsIfAuthorized(name, 'toolRegistration', { logger: this.logger }, error);
    }
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
    let error;
    try {
      // Cast is required because the overload typing on MCP SDK is not correct
      return super.registerResource(name, uriOrTemplate as any, config, callback);
    } catch (e) {
      error = e;
      throw e;
    } finally {
      void sendMetricsIfAuthorized(name, 'resourceRegistration', { logger: this.logger }, error);
    }
  }
}
