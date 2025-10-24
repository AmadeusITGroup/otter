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
  type Logger,
} from '@o3r/logger';
import {
  provideDisableHistoryWrites,
} from '../history';
import {
  getHostInfo,
  persistHostInfo,
} from '../host-info';
import {
  getDefaultClientEndpointStartOptions,
  isEmbedded,
  KNOWN_MESSAGES,
} from '../utils';
import {
  ConnectionConfig,
  ConnectionService,
} from './connect-resources';

/** Options to configure the connection inside the communication protocol */
export interface ConnectionConfigOptions extends Omit<ConnectionConfig, 'id'> {
  /** @inheritdoc */
  id?: string;
  /** Logger used to gather information */
  logger?: Logger;
}

/**
 * Provide the communication protocol connection configuration
 * @param connectionConfigOptions The identifier of the application in the communication protocol ecosystem plus the types of messages able to exchange and a logger object
 */
export function provideConnection(connectionConfigOptions?: ConnectionConfigOptions) {
  persistHostInfo();
  const connectionId = (isEmbedded() && getHostInfo().moduleApplicationId) || connectionConfigOptions?.id;
  if (!connectionId) {
    (connectionConfigOptions?.logger || console).error('An id (moduleId) needs to be provided for the application in order to establish a connection inside the communication protocol');
    return makeEnvironmentProviders([]);
  }
  const config: MessagePeerConfig = {
    id: connectionId,
    messageCheckStrategy: 'version',
    knownMessages: [...KNOWN_MESSAGES, ...(connectionConfigOptions?.knownMessages || [])]
  };
  return makeEnvironmentProviders([
    {
      provide: MESSAGE_PEER_CONFIG, useValue: config
    },
    {
      provide: MESSAGE_PEER_CONNECT_OPTIONS, useValue: getDefaultClientEndpointStartOptions()
    },
    {
      // in the case of the ConnectionService will extend the base service 'useExisting' should be used
      provide: MessagePeerService, useClass: ConnectionService, deps: [MESSAGE_PEER_CONFIG]
    },
    // deactivate history writes to avoid embedded app writing to the host history
    ...isEmbedded() ? [provideDisableHistoryWrites()] : []
  ]);
}
