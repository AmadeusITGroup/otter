import { IFrameBridgeOptions, InternalIframeMessage } from './contracts';

/**
 * Default options for an IFrameBridge
 */
export const IFRAME_BRIDGE_DEFAULT_OPTIONS = {
  handshakeTries: 10,
  handshakeTimeout: 200,
  messageWithResponseTimeout: 1000
} as const satisfies IFrameBridgeOptions;

/**
 * Verifies if a message respects the format expected by an IFrameBridge
 * @param message
 */
export function isSupportedMessage(message: any): message is InternalIframeMessage {
  return typeof message === 'object' &&
    !!message.action &&
    !!message.version &&
    !!message.channelId;
}

/**
 * Generates the html content of an iframe
 * @param scriptUrl script to be executed inside the iframe
 * @param additionalHeader custom html headers stringified
 */
export function generateIFrameContent(scriptUrl: string, additionalHeader = '') {
  return `<html>
  <head>
      <script>
          class Bridge {
            handshakeDone = false;

            queuedMessages = [];

            channelId;

            messagesBuffer = [];

            listener;

            constructor() {
              if (window.parent) {
                  window.addEventListener('message', (event) => {
                      const message = event.data;
                      if (this.isValidMessage(message)) {
                        if (message.action === 'HANDSHAKE_PARENT') {
                          this.channelId = message.channelId;
                          this.sendMessage({action: 'HANDSHAKE_CHILD', version: '1.0', id: message.id});
                          this.handshakeDone = true;
                          this.queuedMessages.forEach((queuedMessage) => this.sendMessage(queuedMessage));
                          this.queuedMessages = [];
                        } else if (this.channelId && this.channelId === message.channelId) {
                          // actual message
                          if (this.listener) {
                            this.listener(message);
                          } else {
                            this.messagesBuffer.push(message);
                          }
                        }
                      }
                  });
              } else {
                throw new Error('Error in child frame bridge: can\\'t access parent window.');
              }
            }

            register(handlerFunction, replayMissedMessages) {
              if (!this.listener) {
                this.listener = handlerFunction;
                if (replayMissedMessages) {
                  this.messagesBuffer.forEach((message) => handlerFunction(message));
                }
                this.messagesBuffer = [];
              }
            }

            isValidMessage(message) {
              return !!message.action && !!message.version && !!message.channelId;
            }

            sendMessage(message) {
              if(this.handshakeDone) {
                window.parent.postMessage({...message, channelId: this.channelId}, '*');
              } else {
                this.queuedMessages.push(message);
              }
            }

            uuid() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
          }

          const BRIDGE = new Bridge();
      </script>
      <script src='${scriptUrl}'></script>
      ${additionalHeader}
  </head>
  <body></body>
</html>`;
}
