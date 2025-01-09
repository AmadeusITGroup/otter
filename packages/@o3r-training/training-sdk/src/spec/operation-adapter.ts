import {PathObject} from '@ama-sdk/core';

/* eslint-disable max-len */
export const OPERATION_ADAPTER: PathObject[] = [{
  path: '/dummy',regexp: new RegExp('^/dummy(?:/(?=$))?$'),operations: [{'method':'get','operationId':'dummyGet'}]
}];
/* eslint-enable max-len */
