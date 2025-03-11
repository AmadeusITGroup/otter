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
} from './connect.directive';

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
  let messagePeerServiceMock: any;
  let messagePeerService: MessagePeerService<Message>;
  let loggerServiceMock: jest.Mocked<LoggerService>;
  let listenHandler: jest.Mocked<any>;

  beforeEach(() => {
    listenHandler = jest.fn();
    messagePeerServiceMock = {
      disconnect: jest.fn(),
      listen: jest.fn().mockImplementation(() => {
        return listenHandler();
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

    parentComponentFixture.detectChanges();
    directiveEl = parentComponentFixture.debugElement.query(By.directive(ConnectDirective));
    directiveInstance = directiveEl.injector.get(ConnectDirective);
    messagePeerService = directiveEl.injector.get<MessagePeerService<Message>>(MessagePeerService);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(directiveInstance).toBeTruthy();
  });

  it('should set the inital src attribute on the iframe', () => {
    expect(directiveEl.nativeElement.src).toBe('https://example-initial.com/');
  });

  it('should set src attribute on the iframe when src attribute changes', () => {
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();
    expect(directiveEl.nativeElement.src).toBe('https://example.com/');
  });

  it('should call disconnect before listening to a new connection', () => {
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com?param=test');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();
    expect(messagePeerService.disconnect).toHaveBeenCalled();
  });

  it('should compute the client origin', () => {
    const safeUrl = domSanitizer.bypassSecurityTrustResourceUrl('https://example.com?param=test');
    parentComponentFixture.componentInstance.src = safeUrl;
    parentComponentFixture.detectChanges();

    // test the client origin even if it's private
    expect((directiveInstance as any).clientOrigin()).toBe('https://example.com');
  });

  it('should report failure', () => {
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
