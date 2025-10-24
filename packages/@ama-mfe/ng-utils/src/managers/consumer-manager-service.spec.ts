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

describe('ConsumerManagerService', () => {
  let service: ConsumerManagerService;
  let messagePeerServiceMock: jest.Mocked<MessagePeerService<VersionedMessage>>;
  let producerManagerServiceMock: jest.Mocked<ProducerManagerService>;
  let messagePeerService: MessagePeerService<VersionedMessage>;
  let messagesSubjectMock: Subject<RoutedMessage<VersionedMessage>>;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  beforeAll(() => {
    jest.spyOn(errorHelpers, 'sendError').mockImplementation(() => {});
  });

  beforeEach(() => {
    messagesSubjectMock = new Subject<RoutedMessage<VersionedMessage>>();
    messagePeerServiceMock = {
      messages$: messagesSubjectMock.asObservable(),
      registerMessage: jest.fn()
    } as unknown as jest.Mocked<MessagePeerService<VersionedMessage>>;

    producerManagerServiceMock = {
      dispatchError: jest.fn()
    } as unknown as jest.Mocked<ProducerManagerService>;

    loggerServiceMock = {
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<LoggerService>;

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
    await jest.runAllTimersAsync();
    expect(producerManagerServiceMock.dispatchError).toHaveBeenCalledWith(message.payload);
    expect(loggerServiceMock.warn).not.toHaveBeenCalled();
  });

  it('should warn if error message not handled', async () => {
    const sourceMessage: VersionedMessage = { type: 'unknown', version: '1.0' };
    const message: RoutedMessage<ErrorMessageV1_0> = { payload: { type: 'error', version: '1.0', reason: 'unknown_type', source: sourceMessage }, from: 'a', to: [] };
    producerManagerServiceMock.dispatchError.mockResolvedValue(false);
    messagesSubjectMock.next(message);
    await jest.runAllTimersAsync();
    expect(producerManagerServiceMock.dispatchError).toHaveBeenCalledWith(message.payload);
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('Error message not handled', message);
  });

  it('should register the messages of a new consumers', async () => {
    const consumer: BasicMessageConsumer = { type: 'test', supportedVersions: { '1.0': (_message) => {} } };
    const consumer2: BasicMessageConsumer = { type: 'test2', supportedVersions: { '1.0': (_message) => {} } };
    service.register(consumer);
    service.register(consumer2);
    await jest.runAllTimersAsync();
    expect(messagePeerService.registerMessage).toHaveBeenCalledTimes(2);
    expect(messagePeerService.registerMessage).toHaveBeenCalledWith({ type: 'test', version: '1.0' });
    expect(messagePeerService.registerMessage).toHaveBeenCalledWith({ type: 'test2', version: '1.0' });
  });

  it('should register multiple consumers with the same message type', async () => {
    const consumer: BasicMessageConsumer = { type: 'test', supportedVersions: { '3.0': (_message) => {} } };
    const consumer2: BasicMessageConsumer = { type: 'test', supportedVersions: { '1.0': (_message) => {}, '2.0': () => {} } };
    service.register(consumer);
    service.register(consumer2);
    await jest.runAllTimersAsync();
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
    await jest.runAllTimersAsync();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('No consumer found for message type: test');
    expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'unknown_type', source: message.payload });
  });

  it('should handle version mismatches', async () => {
    const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': () => {}, '1.0': () => {} } };
    service.register(consumer);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '3.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await jest.runAllTimersAsync();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('No consumer found for message version: 3.0');
    expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'version_mismatch', source: message.payload });
  });

  it('consume additional messages should do nothing for undefined payload', async () => {
    console.warn = jest.fn();
    console.error = jest.fn();
    const message = { payload: undefined } as RoutedMessage<VersionedMessage>;
    messagesSubjectMock.next(message);
    await jest.runAllTimersAsync();
    expect(loggerServiceMock.warn).toHaveBeenCalledWith('Cannot consume a messages with undefined payload.');
  });

  it('should consume additional messages', async () => {
    console.warn = jest.fn();
    const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': jest.fn().mockImplementation(), '1.0': () => {} } };
    service.register(consumer);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await jest.runAllTimersAsync();
    expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    expect(consumer.supportedVersions['2.0']).toHaveBeenCalledWith(message);
  });

  it('should consume additional messages matching multiple consumers', async () => {
    const consumer1: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': jest.fn().mockImplementation(), '1.0': () => {} } };
    const consumer2: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': jest.fn().mockImplementation(), '1.0': () => {} } };
    service.register(consumer1);
    service.register(consumer2);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await jest.runAllTimersAsync();
    expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    expect(consumer1.supportedVersions['2.0']).toHaveBeenCalledWith(message);
    expect(consumer2.supportedVersions['2.0']).toHaveBeenCalledWith(message);
  });

  it('should handle internal errors when consuming additional messages', async () => {
    const internalError = new Error('internal error');
    const consumer: BasicMessageConsumer = { type: 'base_message', supportedVersions: { '2.0': jest.fn().mockRejectedValue(internalError), '1.0': () => {} } };
    service.register(consumer);
    const message: RoutedMessage<VersionedMessage> = { payload: { type: 'base_message', version: '2.0' }, from: 'a', to: [] };
    messagesSubjectMock.next(message);
    await jest.runAllTimersAsync();
    expect(loggerServiceMock.error).toHaveBeenCalledWith('Error while consuming message', internalError);
    expect(errorHelpers.sendError).toHaveBeenCalledWith(messagePeerService, { reason: 'internal_error', source: message.payload });
  });
});
