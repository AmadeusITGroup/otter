import type {
  Server
} from '@ama-sdk/core';

/** List of servers defined in the OpenAPI document */
export const SDK_SERVERS = [
  {
    url: 'https://{environment}/v3',
    description: '',
    variables: {
      'environment': {
        description: 'Software environment',
        defaultValue: 'prd',
        enumValues: ['dev', 'prd'] as const
      }
    }
  }
] as const satisfies Server[];

