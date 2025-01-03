import type {
  ApiClient,
  Plugin,
  PluginAsyncRunner,
  PluginContext,
  RequestOptions,
} from '@ama-sdk/core';

/** Fetch Call Response type */
export type FetchCall = Promise<Response>;

/**
 * Interface of an SDK reply plugin.
 * The plugin will be run on the reply of a call
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

  /** Abort controller to abort fetch call */
  controller: AbortController;
}

/**
 * Interface of an async plugin starter
 */
export interface PluginAsyncStarter {
  /** Determine if the action can start */
  canStart?(): boolean | Promise<boolean>;
}

/**
 * Interface of a Fetch plugin.
 * The plugin will be run around the Fetch call
 */
export interface FetchPlugin extends Plugin<Response, FetchCall> {
  /**
   * Load the plugin with the context
   * @param context Context of fetch plugin
   */
  load(context: FetchPluginContext): PluginAsyncRunner<Response, FetchCall> & PluginAsyncStarter;
}
