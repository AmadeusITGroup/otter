import type {
  Server
} from '@ama-sdk/core';

/** List of servers defined in the OpenAPI document */
export const SDK_SERVERS = [
  {
    url: 'https://api.figma.com',
    description: '',
    variables: {
    }
  }
] as const satisfies Server[];

