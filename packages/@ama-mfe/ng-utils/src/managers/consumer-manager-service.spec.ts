import type {
  Mocked,
} from 'vitest';
/* eslint-disable @typescript-eslint/naming-convention -- versions semver format used as identifiers */
/* eslint-disable no-console -- console calls used for tests*/
import type {
  RoutedMessage,
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  TestBed,
} from '@angular/core/testing';
import {
  LoggerService,
} from '@o3r/logger';
import {
  Subject,
} from 'rxjs';
import {
  ErrorMessageV1_0,
} from '../messages';
import * as errorHelpers from '../messages/error-sender';
import {
  ConsumerManagerService,
} from './consumer-manager-service';
import {
  BasicMessageConsumer,
} from './interfaces';
import {
  ProducerManagerService,
} from './producer-manager-service';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('ConsumerManagerService', () => {
  let service: ConsumerManagerService;
  let messagePeerServiceMock: Mocked<MessagePeerService<VersionedMessage>>;
  let producerManagerServiceMock: Mocked<ProducerManagerService>;
  let messagePeerService: MessagePeerService<VersionedMessage>;
  let messagesSubjectMock: Subject<RoutedMessage<VersionedMessage>>;
  let loggerServiceMock: Mocked<LoggerService>;

  beforeAll(() => {
    vi.spyOn(errorHelpers, 'sendError').mockImplementation(() => {});
  });

  beforeEach(() => {
    messagesSubjectMock = new Subject<RoutedMessage<VersionedMessage>>();
    messagePeerServiceMock = {
      messages$: messagesSubjectMock.asObservable(),
      registerMessage: vi.fn()
    } as unknown as Mocked<MessagePeerService<VersionedMessage>>;

    producerManagerServiceMock = {
      dispatchError: vi.fn()
    } as unknown as Mocked<ProducerManagerService>;

    loggerServiceMock = {
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as Mocked<LoggerService>;

    TestBed.configureTestingModule({
      providers: [
        ConsumerManagerService,
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: MessagePeerService, useValue: messagePeerServiceMock },
        { provide: ProducerManagerService, useValue: producerManagerServiceMock }
      ]
    });

    service = TestBed.inject(ConsumerManagerService);
    messagePeerService = TestBed.inject(MessagePeerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a consumer', () => {
    const consumer: BasicMessageConsumer = { type: 'test', supportedVersions: {} };
    service.register(consumer);
    expect(service.consumers().length).toBe(1);
  });

  it('should unregister a consumer', () => {
    const consumer: BasicMessageConsumer = { type: 'test', supportedVersions: {} };
    service.register(consumer);
    expect(service.consumers().length).toBe(1);
    service.unregister(consumer);
    expect(service.consumers().length).toBe(0);
  });

  it('should handle the double registration of a consumer', () => {
    const consumer: BasicMessageConsumer = { type: 'test', supportedVersions: {} };
    service.register(consumer);
    expect(service.consumers().length).toBe(1);
    service.register(consumer);
    expect(service.consumers().length).toBe(1);
  });

  it('should handle error messages', async () => {
    const sourceMessage: VersionedMessage = { type: 'unknown', version: '1.0' };
    const message: RoutedMessage<ErrorMessageV1_0> = { payload: { type: 'error', version: '1.0', reason: 'unknown_type', source: sourceMessage }, from: 'a', to: [] };
    producerManagerServiceMock.dispatchError.mockResolvedValue(true);
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(producerManagerServiceMock.dispatchError).toHaveBeenCalledWith(message.payload);
    expect(loggerServiceMock.warn).not.toHaveBeenCalled();
  });

  it('should warn if error message not handled', async () => {
    const sourceMessage: VersionedMessage = { type: 'unknown', version: '1.0' };
    const message: RoutedMessage<ErrorMessageV1_0> = { payload: { type: 'error', version: '1.0', reason: 'unknown_type', source: sourceMessage }, from: 'a', to: [] };
    producerManagerServiceMock.dispatchError.mockResolvedValue(false);
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(producerManagerServiceMock.dispatchError).toHaveBeenCalledWith(message.payload);
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('Error message not handled', message);
  });

  it('should register the messages of a new consumers', async () => {
    const consumer: BasicMessageConsumer = { type: 'test', supportedVersions: { '1.0': (_message) => {} } };
    const consumer2: BasicMessageConsumer = { type: 'test2', supportedVersions: { '1.0': (_message) => {} } };
    service.register(consumer);
    service.register(consumer2);
    await vi.runAllTimersAsync();
    expect(messagePeerService.registerMessage).toHaveBeenCalledTimes(2);
    expect(messagePeerService.registerMessage).toHaveBeenCalledWith({ type: 'test', version: '1.0' });
    expect(messagePeerService.registerMessage).toHaveBeenCalledWith({ type: 'test2', version: '1.0' });
  });

  it('should register multiple consumers with the same message type', async () => {
    const consumer: BasicMessageConsumer = { type: 'test', supportedVersions: { '3.0': (_message) => {} } };
    const consumer2: BasicMessageConsumer = { type: 'test', supportedVersions: { '1.0': (_message) => {}, '2.0': () => {} } };
    service.register(consumer);
    service.register(consumer2);
    await vi.runAllTimersAsync();
    expect(messagePeerService.registerMessage).toHaveBeenCalledTimes(3);
    expect(messagePeerService.registerMessage).toHaveBeenCalledWith({ type: 'test', version: '2.0' });
    expect(messagePeerService.registerMessage).toHaveBeenCalledWith({ type: 'test', version: '3.0' });
    expect(messagePeerService.registerMessage).toHaveBeenCalledWith({ type: 'test', version: '1.0' });
  });

  it('should handle types mismatches', async () => {
    const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: {} };
    service.register(consumer);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'test', version: '2.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('No consumer found for message type: test');
    expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'unknown_type', source: message.payload });
  });

  it('should handle version mismatches', async () => {
    const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': () => {}, '1.0': () => {} } };
    service.register(consumer);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '3.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('No consumer found for message version: 3.0');
    expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'version_mismatch', source: message.payload });
  });

  it('consume additional messages should do nothing for undefined payload', async () => {
    console.warn = vi.fn();
    console.error = vi.fn();
    const message = { payload: undefined } as RoutedMessage<VersionedMessage>;
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('Cannot consume a messages with undefined payload.');
  });

  it('should consume additional messages', async () => {
    console.warn = vi.fn();
    const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': vi.fn().mockImplementation(), '1.0': () => {} } };
    service.register(consumer);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    expect(consumer.supportedVersions['2.0']).toHaveBeenCalledWith(message);
  });

  it('should consume additional messages matching multiple consumers', async () => {
    const consumer1: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': vi.fn().mockImplementation(), '1.0': () => {} } };
    const consumer2: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': vi.fn().mockImplementation(), '1.0': () => {} } };
    service.register(consumer1);
    service.register(consumer2);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    expect(consumer1.supportedVersions['2.0']).toHaveBeenCalledWith(message);
    expect(consumer2.supportedVersions['2.0']).toHaveBeenCalledWith(message);
  });

  it('should handle internal errors when consuming additional messages', async () => {
    const internalError = new Error('internal error');
    const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': vi.fn().mockRejectedValue(internalError), '1.0': () => {} } };
    service.register(consumer);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await vi.runAllTimersAsync();
    expect(loggerServiceMock.error).toHaveBeenCalledWith('Error while consuming message', internalError);
    expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'internal_error', source: message.payload });
  });

  describe('semver-compatible dispatch', () => {
    it('should fall back to the highest declared minor when the incoming minor is newer', async () => {
      const handlerV10 = vi.fn();
      const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '1.0': handlerV10 } };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '1.1' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV10).toHaveBeenCalledWith(message);
      expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    });

    it('should prefer the exact minor when declared', async () => {
      const handlerV10 = vi.fn();
      const handlerV11 = vi.fn();
      const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '1.0': handlerV10, 1.1: handlerV11 } };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '1.1' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV11).toHaveBeenCalledWith(message);
      expect(handlerV10).not.toHaveBeenCalled();
    });

    it('should pick the highest compatible minor lower than or equal to the incoming minor', async () => {
      const handlerV10 = vi.fn();
      const handlerV12 = vi.fn();
      const handlerV15 = vi.fn();
      const consumer: BasicMessageConsumer = {
        type: 'base_message',
        supportedVersions: { '1.0': handlerV10, 1.2: handlerV12, 1.5: handlerV15 }
      };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '1.3' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV12).toHaveBeenCalledWith(message);
      expect(handlerV10).not.toHaveBeenCalled();
      expect(handlerV15).not.toHaveBeenCalled();
    });

    it('should not cross major version boundaries when the consumer only declares an older major', async () => {
      const handlerV10 = vi.fn();
      const handlerV11 = vi.fn();
      const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '1.0': handlerV10, 1.1: handlerV11 } };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.0' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV10).not.toHaveBeenCalled();
      expect(handlerV11).not.toHaveBeenCalled();
      expect(loggerServiceMock.warn).toHaveBeenCalledWith('No consumer found for message version: 2.0');
      expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'version_mismatch', source: message.payload });
    });

    it('should not match a consumer that only declares a newer major than the incoming message', async () => {
      const handlerV20 = vi.fn();
      const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': handlerV20 } };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '1.5' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV20).not.toHaveBeenCalled();
      expect(loggerServiceMock.warn).toHaveBeenCalledWith('No consumer found for message version: 1.5');
      expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'version_mismatch', source: message.payload });
    });

    it('should dispatch within the matching major when the consumer declares multiple majors', async () => {
      const handlerV10 = vi.fn();
      const handlerV20 = vi.fn();
      const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '1.0': handlerV10, '2.0': handlerV20 } };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.3' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV20).toHaveBeenCalledWith(message);
      expect(handlerV10).not.toHaveBeenCalled();
    });

    it('should not match a consumer declaring only a higher minor within the same major', async () => {
      const handlerV11 = vi.fn();
      const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { 1.1: handlerV11 } };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '1.0' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV11).not.toHaveBeenCalled();
      expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'version_mismatch', source: message.payload });
    });

    it('should reject malformed incoming version strings', async () => {
      const handlerV10 = vi.fn();
      const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '1.0': handlerV10 } };
      service.register(consumer);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: 'not-a-version' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerV10).not.toHaveBeenCalled();
      expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'version_mismatch', source: message.payload });
    });

    it('should resolve each consumer to its own best-matching minor when multiple consumers share a type', async () => {
      const handlerAV10 = vi.fn();
      const handlerBV10 = vi.fn();
      const handlerBV11 = vi.fn();
      const consumerA: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '1.0': handlerAV10 } };
      const consumerB: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '1.0': handlerBV10, 1.1: handlerBV11 } };
      service.register(consumerA);
      service.register(consumerB);
      const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '1.1' }, from: 'a', to: [] };
      messagesSubjectMock.next(message);
      await vi.runAllTimersAsync();
      expect(handlerAV10).toHaveBeenCalledWith(message);
      expect(handlerBV11).toHaveBeenCalledWith(message);
      expect(handlerBV10).not.toHaveBeenCalled();
    });
  });
});
