import { ApiTypes } from '../../fwk/api';
import { EmptyResponseError, RequestFailedError } from '../../fwk/errors';
import { PluginRunner, ReplyPlugin, ReplyPluginContext } from '../core';

/**
 * Plugin to fire an exception on wrong response / data
 */
export class ExceptionReply<V extends Record<string, any> | undefined = Record<string, any>> implements ReplyPlugin<V | Record<string, unknown>, V> {

  /**
   * @param callback Function called in case of exception. If provided, this function is responsible for throwing the exception or not
   */
  constructor(private callback?: (res: V, error: Error | undefined) => V) {
  }

  public load<K>(context: ReplyPluginContext<K>): PluginRunner<V | Record<string, unknown>, V> {
    return {
      transform: (res: V) => {
        if (context.exception) {
          return res;
        }

        const errorContext = { apiName: context.apiName, operationId: context.operationId, url: context.url, origin: context.origin };
        let error: Error | undefined;

        if (!context.response) {
          error = new EmptyResponseError('Fail to Fetch', undefined, errorContext);
        }

        else if (
          context.apiType === ApiTypes.DAPI &&
            context.response.status === 200 &&
            (!res || (!res.data && typeof res.errors !== 'undefined')) // Some DAPI replies have data as optional, so we only throw if response contains errors
        ) {
          error = new EmptyResponseError<V>(context.response.statusText, res, errorContext);
        }

        else if (!context.response.ok) {
          error = new RequestFailedError<V>(context.response.statusText, context.response.status, res, errorContext);
        }

        else if (!res) {
          if (context.response.status === 204) {
            res = {} as V;
          }
          error = new EmptyResponseError<V>(context.response.statusText, res, errorContext);
        }

        if (error) {
          if (this.callback) {
            return this.callback(res, error);
          } else {
            throw error;
          }
        }
        return res;
      }
    };
  }

}
