import {
  firstValueFrom,
  fromEvent,
  Observable
} from 'rxjs';
import {
  filter,
  map,
  share,
  timeout
} from 'rxjs/operators';
import {
  v4
} from 'uuid';
import {
  IFrameBridgeOptions,
  IframeMessage,
  InternalIframeMessage
} from './contracts';
import {
  IFRAME_BRIDGE_DEFAULT_OPTIONS,
  isSupportedMessage
} from './helpers';

/**
 * Bridge that exposes an easy abstraction layer to communicate between a Host and an IFrame using the
 * postMessage API.
 */
export class IframeBridge {
  /** ID used to ensure that the Bridge only processes messages meant for this instance, since postMessage is global to the window. */
  private readonly channelId: string;

  /** Observable that emits all the messages received from the IFrame. */
  private readonly internalMessages$: Observable<InternalIframeMessage>;

  /** Promise that will resolve once the handshake has been completed, undefined if it's already done. */
  private readonly handshakePromise?: Promise<void>;

  /** Options to configure the behaviour of the Bridge. */
  private readonly options: IFrameBridgeOptions;

  /**
   * Observable that emits all the messages received from the IFrame and that are
   * not a direct response to a request.
   */
  public readonly messages$: Observable<InternalIframeMessage>;

  constructor(parent: Window, private readonly child: HTMLIFrameElement, options: Partial<IFrameBridgeOptions> = {}) {
    this.options = { ...IFRAME_BRIDGE_DEFAULT_OPTIONS, ...options };
    this.channelId = v4();
    this.internalMessages$ = fromEvent(parent, 'message').pipe(
      filter((event): event is MessageEvent<InternalIframeMessage> => {
        const messageEvent = event as MessageEvent<InternalIframeMessage>;
        return isSupportedMessage(messageEvent.data) && messageEvent.data.channelId === this.channelId;
      }),
      map((event) => event.data),
      share()
    );
    this.messages$ = this.internalMessages$.pipe(
      // Here we remove all the messages having an "ID" because they are bound to their corresponding request and
      // are returned directly by the function sendMessageAndWaitForResponse
      filter((message) => !message.id)
    );

    this.handshakePromise = this.handshake();
  }

  private async handshake() {
    for (let i = 0; i < this.options.handshakeTries; i++) {
      try {
        await this._sendMessageAndWaitForResponse({
          action: 'HANDSHAKE_PARENT',
          version: '1.0'
        }, this.options.handshakeTimeout);
        return;
      } catch {}
    }
    throw new Error('Handshake failed.');
  }

  private _sendMessage(message: IframeMessage, messageId?: string) {
    if (this.child.contentWindow) {
      this.child.contentWindow.postMessage({ ...message, channelId: this.channelId, id: messageId }, '*');
    }
  }

  private _sendMessageAndWaitForResponse(message: IframeMessage, timeoutMilliseconds: number = this.options.messageWithResponseTimeout) {
    const id = v4();
    const promise = firstValueFrom(
      this.internalMessages$.pipe(
        filter((response) => response.id === id),
        timeout(timeoutMilliseconds)
      )
    );
    void this._sendMessage(message, id);
    return promise;
  }

  /**
   * Method to send a message to the script run in the iframe
   * @param message message object
   * @param messageId message identifier
   */
  public async sendMessage(message: IframeMessage, messageId?: string) {
    await this.handshakePromise;
    this._sendMessage(message, messageId);
  }

  /**
   * Method to send a message to the script run in the iframe and wait for an answer
   * @param message
   * @param timeoutMilliseconds
   */
  public async sendMessageAndWaitForResponse(message: IframeMessage, timeoutMilliseconds: number = this.options.messageWithResponseTimeout) {
    await this.handshakePromise;
    return this._sendMessageAndWaitForResponse(message, timeoutMilliseconds);
  }
}
