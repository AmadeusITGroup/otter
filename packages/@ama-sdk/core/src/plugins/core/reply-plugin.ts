import { ApiTypes } from '../../fwk/api';
import { ReviverType } from '../../fwk/Reviver';
import { Plugin, PluginRunner } from './plugin';

/**
 * Interface of an SDK reply plugin.
 * The plugin will be run on the reply of a call
 */
export interface ReplyPluginContext<T> {
  /** Reply reviver function */
  reviver?: ReviverType<T>;

  /** dictionary received in the reply */
  dictionaries?: { [key: string]: any };

  /** Response from Fetch call */
  response?: Response;

  /** Type of the API */
  apiType: ApiTypes | string;

  /** Name of the API */
  apiName?: string;

  /** Exception thrown during call/parse of the response */
  exception?: Error;

  /** Operation ID */
  operationId?: string;

  /** Base url */
  url?: string;

  /** Origin domain initiating the call */
  origin?: string | null;
}

/**
 * Interface of an SDK reply plugin.
 * The plugin will be run on the reply of a call
 */
export interface ReplyPlugin<T, V = {[key: string]: any}> extends Plugin<T, V> {
  /** Load the plugin with the context */
  load<K>(context: ReplyPluginContext<K>): PluginRunner<T | K, V | undefined>;
}
