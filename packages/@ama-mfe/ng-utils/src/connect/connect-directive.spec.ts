import {
  Message,
} from '@amadeus-it-group/microfrontends';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  Component,
  DebugElement,
  inject,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  By,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  LoggerService,
} from '@o3r/logger';
import {
  ConnectDirective,
} from './connect-directive';

@Component({
  imports: [ConnectDirective],
  standalone: true,
  template: `<iframe [connect]="connect" [src]="src"></iframe>`
})
class ParentComponent {
  public connect = 'testConnectId';
  public src: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl('https://example-initial.com');
}

describe('ConnectDirective', () => {
  let directiveEl: DebugElement;
  let directiveInstance: ConnectDirective;
  let parentComponentFixture: ComponentFixture<ParentComponent>;
  let domSanitizer: DomSanitizer;
  let messagePeerServiceMock: Pick<MessagePeerService<Message>, 'disconnect' | 'listen'>;
  let messagePeerService: MessagePeerService<Message>;
  let loggerServiceMock: jest.Mocked<LoggerService>;
  let listenHandler: jest.Mocked<() => {}>;
  let stopHandshakeListening: jest.Mocked<() => {}>;

  beforeEach(() => {
    listenHandler = jest.fn();
    stopHandshakeListening = jest.fn();
    messagePeerServiceMock = {
      disconnect: jest.fn(),
      listen: jest.fn().mockImplementation(() => {
        listenHandler();
        return stopHandshakeListening;
      })
    };

    loggerServiceMock = {
      warn: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<LoggerService>;

    parentComponentFixture = TestBed.configureTestingModule({
      imports: [ParentComponent, ConnectDirective],
      providers: [
        { provide: LoggerService, useValue: loggerServiceMock },
        { provide: MessagePeerService, useValue: messagePeerServiceMock }
      ]
    }).createComponent(ParentComponent);

    directiveEl = parentComponentFixture.debugElement.query(By.directive(ConnectDirective));
    directiveInstance = directiveEl.injector.get(ConnectDirective);
    messagePeerService = directiveEl.injector.get<MessagePeerService<Message>>(MessagePeerService);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(directiveInstance).toBeTruthy();
  });

  it('should set the inital src attribute on the iframe', () => {
    parentComponentFixture.detectChanges();
    expect(directiveEl.nativeElement.src).toBe('https://example-initial.com/');
  });

  it('should set src attribute on the iframe when src attribute changes', () => {
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();
    expect(directiveEl.nativeElement.src).toBe('https://example.com/');
  });

  it('should not call disconnect initially before listening for a new connection', () => {
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com?param=test');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();
    expect(messagePeerService.disconnect).not.toHaveBeenCalled();
    expect(listenHandler).toHaveBeenCalled();
    expect(stopHandshakeListening).not.toHaveBeenCalled();
  });

  it('should call disconnect before connection needs to be re-established', () => {
    // initial connection
    parentComponentFixture.detectChanges();
    expect(messagePeerService.disconnect).not.toHaveBeenCalled();
    expect(listenHandler).toHaveBeenCalledTimes(1);
    expect(stopHandshakeListening).not.toHaveBeenCalled();

    // change of src - should reconnect
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com?param=test');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();
    expect(messagePeerService.disconnect).toHaveBeenCalledTimes(1);
    expect(listenHandler).toHaveBeenCalledTimes(2);
    expect(stopHandshakeListening).toHaveBeenCalledTimes(1);
  });

  it('should call disconnect and stop listening on destroy', () => {
    // directive creation
    parentComponentFixture.detectChanges();

    // directive destruction
    parentComponentFixture.destroy();
    expect(messagePeerService.disconnect).toHaveBeenCalledTimes(1);
    expect(stopHandshakeListening).toHaveBeenCalledTimes(1);
  });

  it('should compute the client origin', () => {
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com?param=test');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();

    // test the client origin even if it's private
    expect((directiveInstance as any).clientOrigin()).toBe('https://example.com');
  });

  it('should not connect if connection ID is not provided', () => {
    parentComponentFixture.componentInstance.connect = undefined;
    parentComponentFixture.detectChanges();
    expect(messagePeerService.disconnect).not.toHaveBeenCalled();
    expect(listenHandler).not.toHaveBeenCalled();
    expect(stopHandshakeListening).not.toHaveBeenCalled();
  });

  it('should not connect if origin is not provided', () => {
    parentComponentFixture.componentInstance.src = domSanitizer.bypassSecurityTrustResourceUrl('');
    parentComponentFixture.detectChanges();
    expect(messagePeerService.disconnect).not.toHaveBeenCalled();
    expect(listenHandler).not.toHaveBeenCalled();
    expect(stopHandshakeListening).not.toHaveBeenCalled();
  });

  it('should report failure from listen() call', () => {
    const errorToThrow = new Error('some error');
    listenHandler = () => {
      throw errorToThrow;
    };
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com?param=test');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();

    expect(loggerServiceMock.error).toHaveBeenCalledWith(expect.stringMatching(/.+/), errorToThrow);
  });
});
