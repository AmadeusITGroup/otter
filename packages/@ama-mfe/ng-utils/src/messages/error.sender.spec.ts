import type {
  MessagePeerType,
} from '@amadeus-it-group/microfrontends';
import type {
  ErrorContent,
} from './error/index';
import {
  isErrorMessage,
  sendError,
} from './error.sender';

describe('sendError', () => {
  it('should send an error message with the correct content', () => {
    const mockPeer = {
      send: jest.fn()
    } as unknown as MessagePeerType<any>;
    const content: ErrorContent = {
      reason: 'unknown_type',
      source: { type: 'my_type', version: '1' }
    };

    sendError(mockPeer, content);

    expect(mockPeer.send).toHaveBeenCalledWith({
      type: 'error',
      version: '1.0',
      ...content
    });
  });
});

describe('isErrorMessage', () => {
  it('should return true for a valid error message', () => {
    const message = {
      type: 'error',
      reason: 'Test error',
      code: 500
    };

    expect(isErrorMessage(message)).toBe(true);
  });

  it('should return false for a non-error message', () => {
    const message = {
      type: 'info',
      reason: 'Test info',
      code: 200
    };

    expect(isErrorMessage(message)).toBe(false);
  });

  it('should return false for an error message without specified reason', () => {
    const message = {
      type: 'error',
      code: 500
    };

    expect(isErrorMessage(message)).toBe(false);
  });
});
