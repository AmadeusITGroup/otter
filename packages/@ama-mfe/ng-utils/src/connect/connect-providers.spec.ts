import type {
  Mock,
} from 'vitest';
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
} from './connect-providers';
import {
  ConnectionService,
} from './connect-resources';

vi.mock('@angular/core', async () => {
  const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
  return {
    ...actual,
    makeEnvironmentProviders: vi.fn(actual.makeEnvironmentProviders)
  };
});

vi.mock('../host-info/host-info', async () => ({
  getHostInfo: vi.fn(),
  persistHostInfo: vi.fn()
}));
vi.mock('../utils', async () => ({
  ...await vi.importActual<typeof import('../utils')>('../utils'),
  isEmbedded: vi.fn()
}));

vi.mock('../history/history-providers', async () => ({
  provideHistoryOverrides: vi.fn()
}));

describe('provideConnection', () => {
  const mockLogger = { error: vi.fn(), log: vi.fn(), warn: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty providers and log error if no ID is provided', () => {
    (getHostInfo as Mock).mockReturnValue({ moduleApplicationId: undefined });

    provideConnection({ logger: mockLogger });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('An id (moduleId) needs to be provided'));
    expect(makeEnvironmentProviders).toHaveBeenCalledWith([]);
  });

  it('should use moduleApplicationId from getHostInfo if available', () => {
    (isEmbedded as Mock).mockReturnValue(true);
    (getHostInfo as Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });

    provideConnection();

    expect(makeEnvironmentProviders).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ provide: MESSAGE_PEER_CONFIG, useValue: expect.objectContaining({ id: 'my-module-id-from-host' }) }),
        expect.objectContaining({ provide: MESSAGE_PEER_CONNECT_OPTIONS })
      ])
    );
  });

  it('should use connectionConfigOptions.id if moduleApplicationId is not available', () => {
    (getHostInfo as Mock).mockReturnValue({ moduleApplicationId: undefined });
    provideConnection({ id: 'my-module-id-from-param' });
    expect(makeEnvironmentProviders).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ provide: MESSAGE_PEER_CONFIG, useValue: expect.objectContaining({ id: 'my-module-id-from-param' }) }),
        expect.objectContaining({ provide: MESSAGE_PEER_CONNECT_OPTIONS })
      ])
    );
  });

  it('should merge known messages with custom ones correctly', () => {
    (getHostInfo as Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });
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
    (getHostInfo as Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });

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
    (getHostInfo as Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });
    (isEmbedded as Mock).mockReturnValue(false);

    provideConnection();
    expect(provideHistoryOverrides).not.toHaveBeenCalled();
  });

  it('should patch browser history in an embedded application', () => {
    (getHostInfo as Mock).mockReturnValue({ moduleApplicationId: 'my-module-id-from-host' });
    (isEmbedded as Mock).mockReturnValue(true);

    provideConnection();
    expect(provideHistoryOverrides).toHaveBeenCalled();
  });
});
