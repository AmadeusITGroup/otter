import type {
  HttpResponse,
} from '@angular/common/http';
import type {
  Observable,
} from 'rxjs';
import type {
  ApiClient,
} from '../../fwk/core/api-client';
import type {
  PluginContext,
} from './plugin';
import type {
  RequestOptions,
} from './request-plugin';

/**
 * Interface of an async runnable plugin
 */
export interface PluginObservableRunner<T, V> {
  /** Transformation function */
  transform(data: V): Observable<T>;
}

/** Angular HTTP Call Response type */
export type AngularCall = Observable<HttpResponse<any>>;

/**
 * Interface of an SDK reply plugin.
 * The plugin will be run on the reply of a call
 */
export interface AngularPluginContext extends PluginContext {
  /** URL targeted */
  url: string;

  /** List of loaded plugins apply to the Angular HTTP call */
  angularPlugins: PluginObservableRunner<HttpResponse<any>, AngularCall>[];

  /** Api Client processing the call the the API */
  apiClient: ApiClient;

  /** Angular call options */
  requestOptions: RequestOptions;
}

/**
 * Interface of a Angular plugin.
 * The plugin will be run around the Angular Http call
 */
export interface AngularPlugin {
  /**
   * Load the plugin with the context
   * @param context Context of Angular plugin
   */
  load(context: AngularPluginContext): PluginObservableRunner<HttpResponse<any>, AngularCall>;
}
