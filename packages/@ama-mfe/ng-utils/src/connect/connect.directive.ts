import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostBinding,
  inject,
  input,
  SecurityContext,
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  LoggerService,
} from '@o3r/logger';

@Directive({
  selector: 'iframe[connect]',
  standalone: true
})
export class ConnectDirective {
  /**
   * The connection ID required for the message peer service.
   */
  public connect = input.required<string>();

  /**
   * The sanitized source URL for the iframe.
   */
  public src = input<SafeResourceUrl>();

  /**
   * Binds the `src` attribute of the iframe to the sanitized source URL.
   */
  @HostBinding('src')
  public get srcAttr() {
    return this.src();
  }

  private readonly messageService = inject(MessagePeerService);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly elRef = inject(ElementRef);

  private readonly clientOrigin = computed(() => {
    const src = this.src();
    const srcString = src && this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, src);
    return srcString && new URL(srcString).origin;
  });

  constructor() {
    const logger = inject(LoggerService);
    // When the origin url or the peer id changes it will remake the connection with the new updates. The old connection is closed
    effect(async () => {
      const clientOrigin = this.clientOrigin();
      const connectId = this.connect();
      const moduleWindow = (this.elRef.nativeElement as HTMLIFrameElement).contentWindow;

      this.messageService.disconnect();
      if (clientOrigin && moduleWindow) {
        try {
          await this.messageService.listen(connectId, {
            window: moduleWindow,
            origin: clientOrigin
          });
        } catch (e) {
          logger.error(`Fail to connect to client (connection ID: ${connectId})`, e);
        }
      }
    });
    // When the directive is destroyed clean up the connection too.
    inject(DestroyRef).onDestroy(() => this.messageService.disconnect());
  }
}
