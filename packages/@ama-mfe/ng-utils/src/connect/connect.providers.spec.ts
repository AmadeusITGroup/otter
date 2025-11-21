import {
  MESSAGE_PEER_CONFIG,
  MESSAGE_PEER_CONNECT_OPTIONS,
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideHistoryOverrides,
} from '../history';
import {
  getHostInfo,
} from '../host-info/host-info';
import {
  isEmbedded,
  KNOWN_MESSAGES,
} from '../utils';
import {
  provideConnection,
} from './connect.providers';
import {
  ConnectionService,
} from './connect.resources';

jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core');
  return {
    ...actual,
    makeEnvironmentProviders: jest.fn(actual.makeEnvironmentProviders)
  };
});

jest.mock('../host-info/host-info', () => ({
  getHostInfo: jest.fn(),
  persistHostInfo: jest.fn()
}));
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  isEmbedded: jest.fn()
}));

jest.mock('../history/history.providers', () => ({
  provideHistoryOverrides: jest.fn()
}));

describe('provideConnection', () => {
  const mockLogger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty providers and log error if no ID is provided', () => {
    (getHostInfo as jest.Mock).mockReturnValue({ moduleApplicationId: undefined });

    provideConnection({ logger: mockLogger });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('An id (moduleId) needs to be provided'));
    expect(makeEnvironmentProviders).toHaveBeenCalledWith([]);
  });

  it('should use moduleApplicationId from getHostInfo if available', () => {
    (isEmbedded as jest.Mock).mockReturnValue(true);
    (getHostInfo as jest.Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });

    provideConnection();

    expect(makeEnvironmentProviders).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ provide: MESSAGE_PEER_CONFIG, useValue: expect.objectContaining({ id: 'my-module-id-from-host' }) }),
        expect.objectContaining({ provide: MESSAGE_PEER_CONNECT_OPTIONS })
      ])
    );
  });

  it('should use connectionConfigOptions.id if moduleApplicationId is not available', () => {
    (getHostInfo as jest.Mock).mockReturnValue({ moduleApplicationId: undefined });
    provideConnection({ id: 'my-module-id-from-param' });
    expect(makeEnvironmentProviders).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ provide: MESSAGE_PEER_CONFIG, useValue: expect.objectContaining({ id: 'my-module-id-from-param' }) }),
        expect.objectContaining({ provide: MESSAGE_PEER_CONNECT_OPTIONS })
      ])
    );
  });

  it('should merge known messages with custom ones correctly', () => {
    (getHostInfo as jest.Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });
    const customMessage = { type: 'CUSTOM_MESSAGE' };
    provideConnection({ knownMessages: [customMessage] });
    expect(makeEnvironmentProviders).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          provide: MESSAGE_PEER_CONFIG, useValue:
            expect.objectContaining({ id: 'my-module-id-from-host', knownMessages: [...KNOWN_MESSAGES, customMessage] })
        })
      ])
    );
  });

  it('should provide correct services and dependencies', () => {
    (getHostInfo as jest.Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });

    provideConnection();

    expect(makeEnvironmentProviders).toHaveBeenCalledWith(
      [
        {
          provide: MESSAGE_PEER_CONFIG,
          useValue: { id: 'my-module-id-from-host', messageCheckStrategy: 'version', knownMessages: KNOWN_MESSAGES }
        },
        expect.objectContaining({ provide: MESSAGE_PEER_CONNECT_OPTIONS }),
        {
          // in the case of the ConnectionService will extend the base service 'useExisting' should be used
          provide: MessagePeerService, useClass: ConnectionService, deps: [MESSAGE_PEER_CONFIG]
        }
      ]
    );
  });

  it('should not patch browser history in a non-embedded application', () => {
    (getHostInfo as jest.Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });
    (isEmbedded as jest.Mock).mockReturnValue(false);

    provideConnection();
    expect(provideHistoryOverrides).not.toHaveBeenCalled();
  });

  it('should patch browser history in an embedded application', () => {
    (getHostInfo as jest.Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });
    (isEmbedded as jest.Mock).mockReturnValue(true);

    provideConnection();
    expect(provideHistoryOverrides).toHaveBeenCalled();
  });
});
