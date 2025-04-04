import {
  MESSAGE_PEER_CONFIG,
  MESSAGE_PEER_CONNECT_OPTIONS,
  MessagePeerConfig,
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideHostInfo,
} from '../host-info';
import {
  getDefaultClientEndpointStartOptions,
  KNOWN_MESSAGES,
} from '../utils';
import {
  ConnectionConfig,
  ConnectionService,
} from './connect.resources';

/**
 * Provide the communication protocol connection configuration
 * @param connectionConfig The identifier of the application in the communication protocol ecosystem plus the types of messages able to exchange
 */
export function provideConnection(connectionConfig: ConnectionConfig) {
  const config: MessagePeerConfig = { id: connectionConfig.id, knownMessages: [...KNOWN_MESSAGES, ...(connectionConfig.knownMessages || [])] };
  return makeEnvironmentProviders([
    provideHostInfo(),
    {
      provide: MESSAGE_PEER_CONFIG, useValue: config
    },
    {
      provide: MESSAGE_PEER_CONNECT_OPTIONS, useValue: getDefaultClientEndpointStartOptions()
    },
    {
      // in the case of the ConnectionService will extend the base service 'useExisting' should be used
      provide: MessagePeerService, useClass: ConnectionService, deps: [MESSAGE_PEER_CONFIG]
    }
  ]);
}
