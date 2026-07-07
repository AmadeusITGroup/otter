import {
  TestBed,
} from '@angular/core/testing';
import type {
  ErrorContent,
} from '../messages/index';
import type {
  MessageProducer,
} from './interfaces';
import {
  ProducerManagerService,
} from './producer-manager-service';

describe('ProducerManagerService', () => {
  let service: ProducerManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProducerManagerService]
    });

    service = TestBed.inject(ProducerManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a producer', () => {
    const producer: MessageProducer = { types: ['test'], handleError: jest.fn() };
    service.register(producer);
    expect(service.producers.length).toBe(1);
  });

  it('should unregister a producer', () => {
    const producer: MessageProducer = { types: ['test'], handleError: jest.fn() };
    service.register(producer);
    expect(service.producers.length).toBe(1);
    service.unregister(producer);
    expect(service.producers.length).toBe(0);
  });

  it('should handle the double registration of a producer', () => {
    const producer: MessageProducer = { types: ['test'], handleError: jest.fn() };
    service.register(producer);
    expect(service.producers.length).toBe(1);
    service.register(producer);
    expect(service.producers.length).toBe(1);
  });

  it('should dispatch error messages', async () => {
    const producer: MessageProducer = { types: ['test'], handleError: jest.fn().mockResolvedValue(true) };
    service.register(producer);
    const message: ErrorContent = { source: { type: 'test', version: '1.0' }, reason: 'unknown_type' };
    const result = await service.dispatchError(message);
    expect(result).toBe(true);
    expect(producer.handleError).toHaveBeenCalledWith(message);
  });

  it('should dispatch error messages when matching multiple producers', async () => {
    const producer: MessageProducer = { types: ['test'], handleError: jest.fn().mockResolvedValue(true) };
    const producer2: MessageProducer = { types: ['test', 'test2'], handleError: jest.fn().mockResolvedValue(true) };
    service.register(producer);
    service.register(producer2);
    const message: ErrorContent = { source: { type: 'test', version: '1.0' }, reason: 'unknown_type' };
    const result = await service.dispatchError(message);
    expect(result).toBe(true);
    expect(producer.handleError).toHaveBeenCalledWith(message);
    expect(producer2.handleError).toHaveBeenCalledWith(message);
  });

  it('should return false if no producers handle the error message', async () => {
    const message: ErrorContent = { source: { type: 'test', version: '1.0' }, reason: 'unknown_type' };
    const result = await service.dispatchError(message);
    expect(result).toBe(false);
  });
});
