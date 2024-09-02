import type { ApiClient } from '../../fwk/core/api-client';
import type { Plugin, PluginAsyncRunner, PluginContext } from './plugin';
import type { RequestOptions } from './request-plugin';

/**
 * Fetch Call Response type
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export type FetchCall = Promise<Response>;

/**
 * Interface of an SDK reply plugin.
 * The plugin will be run on the reply of a call
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export interface FetchPluginContext extends PluginContext {
  /** URL targeted */
  url: string;

  /** Fetch call options */
  options: RequestInit | RequestOptions;

  /** List of loaded plugins apply to the fetch call */
  fetchPlugins: PluginAsyncRunner<Response, FetchCall>[];

  /** Api Client processing the call the the API */
  apiClient: ApiClient;

  // TODO Now supported for all the modern browsers - should become mandatory in @ama-sdk/core@11.0
  /** Abort controller to abort fetch call */
  controller?: AbortController;
}

/**
 * Interface of an async plugin starter
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export interface PluginAsyncStarter {
  /** Determine if the action can start */
  canStart?(): boolean | Promise<boolean>;
}

/**
 * Interface of a Fetch plugin.
 * The plugin will be run around the Fetch call
 * @deprecated Use the one exposed by {@link @ama-sdk/client-fetch}, will be removed in v13
 */
export interface FetchPlugin extends Plugin<Response, FetchCall> {
  /**
   * Load the plugin with the context
   * @param context Context of fetch plugin
   */
  load(context: FetchPluginContext): PluginAsyncRunner<Response, FetchCall> & PluginAsyncStarter;
}
