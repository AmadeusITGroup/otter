import { ApiTypes } from '../../fwk/api';
import { EmptyResponseError, RequestFailedError } from '../../fwk/errors';
import { PluginRunner, ReplyPlugin, ReplyPluginContext } from '../core';

/**
 * Plugin to fire an exception on wrong response / data
 */
export class ExceptionReply<V extends Record<string, any> | undefined = Record<string, any>> implements ReplyPlugin<V | Record<string, unknown>, V> {

  public load<K>(context: ReplyPluginContext<K>): PluginRunner<V | Record<string, unknown>, V> {
    return {
      transform: (res: V) => {
        if (context.exception) {
          return res;
        }

        const errorContext = { apiName: context.apiName, operationId: context.operationId };

        if (!context.response) {
          throw new EmptyResponseError('Fail to Fetch', undefined, errorContext);
        }

        if (
          context.apiType === ApiTypes.DAPI &&
            context.response.status === 200 &&
            (!res || (!res.data && typeof res.errors !== 'undefined')) // Some DAPI replies have data as optional, so we only throw if response contains errors
        ) {
          throw new EmptyResponseError<V>(context.response.statusText, res, errorContext);
        }

        if (!context.response.ok) {
          throw new RequestFailedError<V>(context.response.statusText, context.response.status, res, errorContext);
        }

        if (!res) {
          if (context.response.status === 204) {
            return {};
          }
          throw new EmptyResponseError<V>(context.response.statusText, res, errorContext);
        }

        return res;
      }
    };
  }

}
