import type {
  RoutedMessage,
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import {
  Component,
  inject,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  AbstractMessageConsumer,
} from './abstract-message-consumer-service';
import {
  ConsumerManagerService,
} from './consumer-manager-service';
import {
  MessageCallback,
} from './interfaces';

interface TestMessage extends VersionedMessage {
  type: 'test-message';
  version: '1.0';
}

class TestConsumer extends AbstractMessageConsumer<TestMessage> {
  public readonly type = 'test-message' as const;
  public readonly supportedVersions = {
    '1.0': ((_message: RoutedMessage<TestMessage & { version: '1.0' }>) => {}) as MessageCallback<TestMessage & { version: '1.0' }>
  };

  constructor(autoStart = true) {
    super(autoStart);
  }
}

class NoAutoStartConsumer extends AbstractMessageConsumer<TestMessage> {
  public readonly type = 'test-message' as const;
  public readonly supportedVersions = {
    '1.0': ((_message: RoutedMessage<TestMessage & { version: '1.0' }>) => {}) as MessageCallback<TestMessage & { version: '1.0' }>
  };

  constructor() {
    super(false);
  }
}

@Component({
  selector: 'test-host',
  template: '',
  standalone: true,
  providers: [TestConsumer]
})
class TestHostComponent {
  public consumer = inject(TestConsumer);
}

@Component({
  selector: 'test-host-no-auto',
  template: '',
  standalone: true,
  providers: [NoAutoStartConsumer]
})
class NoAutoStartHostComponent {
  public consumer = inject(NoAutoStartConsumer);
}

describe('AbstractMessageConsumer', () => {
  let consumerManagerServiceMock: jest.Mocked<ConsumerManagerService>;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    consumerManagerServiceMock = {
      register: jest.fn(),
      unregister: jest.fn()
    } as unknown as jest.Mocked<ConsumerManagerService>;

    TestBed.configureTestingModule({
      imports: [TestHostComponent, NoAutoStartHostComponent],
      providers: [
        { provide: ConsumerManagerService, useValue: consumerManagerServiceMock }
      ]
    });
  });

  it('should auto-start and register with the consumer manager service', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    expect(consumerManagerServiceMock.register).toHaveBeenCalledWith(fixture.componentInstance.consumer);
  });

  it('should not register when autoStart is false', () => {
    TestBed.createComponent(NoAutoStartHostComponent);
    expect(consumerManagerServiceMock.register).not.toHaveBeenCalled();
  });

  it('should unregister when stop is called', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    const consumer = fixture.componentInstance.consumer;
    consumer.stop();
    expect(consumerManagerServiceMock.unregister).toHaveBeenCalledWith(consumer);
  });

  it('should unregister when the component is destroyed', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    const consumer = fixture.componentInstance.consumer;
    fixture.destroy();
    expect(consumerManagerServiceMock.unregister).toHaveBeenCalledWith(consumer);
  });

  it('should re-register when start is called after stop', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    const consumer = fixture.componentInstance.consumer;
    consumer.stop();
    consumerManagerServiceMock.register.mockClear();
    consumer.start();
    expect(consumerManagerServiceMock.register).toHaveBeenCalledWith(consumer);
  });

  it('should unregister on destroy after re-starting', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    const consumer = fixture.componentInstance.consumer;
    consumer.stop();
    consumer.start();
    consumerManagerServiceMock.unregister.mockClear();
    fixture.destroy();
    expect(consumerManagerServiceMock.unregister).toHaveBeenCalledWith(consumer);
  });

  it('should be safe to call stop multiple times', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    const consumer = fixture.componentInstance.consumer;
    consumer.stop();
    consumer.stop();
    expect(consumerManagerServiceMock.unregister).toHaveBeenCalledTimes(2);
  });

  it('should not unregister again on destroy after stop has been called', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    const consumer = fixture.componentInstance.consumer;
    consumer.stop();
    consumerManagerServiceMock.unregister.mockClear();
    fixture.destroy();
    expect(consumerManagerServiceMock.unregister).not.toHaveBeenCalled();
  });

  it('should clean up the previous destroy callback when start is called again', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    const consumer = fixture.componentInstance.consumer;
    consumer.start();
    consumerManagerServiceMock.unregister.mockClear();
    fixture.destroy();
    expect(consumerManagerServiceMock.unregister).toHaveBeenCalledTimes(1);
  });
});
