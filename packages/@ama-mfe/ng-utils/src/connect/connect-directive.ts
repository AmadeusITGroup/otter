import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  computed,
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
  private readonly iframeElement = inject<ElementRef<HTMLIFrameElement>>(ElementRef).nativeElement;

  private readonly clientOrigin = computed(() => {
    const src = this.src();
    const srcString = src && this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, src);
    return srcString && new URL(srcString).origin;
  });

  constructor() {
    const logger = inject(LoggerService);

    // When the origin or connection ID change - reconnect the message service
    effect((onCleanup) => {
      let stopHandshakeListening = () => { /* no op */ };

      const origin = this.clientOrigin();
      const id = this.connect();
      const source = this.iframeElement.contentWindow;

      // listen for handshakes only if we know the origin and were given a connection ID
      if (origin && source && id) {
        try {
          stopHandshakeListening = this.messageService.listen({ id, source, origin });
        } catch (e) {
          logger.error(`Failed to start listening for (connection ID: ${id})`, e);
        }
      }

      // stop listening for handshakes and disconnect previous connection when:
      // - origin/connection ID change
      // - the directive is destroyed
      onCleanup(() => {
        stopHandshakeListening();
        this.messageService.disconnect();
      });
    });
  }
}
