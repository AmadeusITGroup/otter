/* eslint-disable no-console -- this file will be injected in the app and cannot have dependencies */
import type {
  applicationMessageTarget,
  ConnectContentMessage,
  OtterMessage
} from '@o3r/core';
/*
This script is injected into the page by the Otter Devtools extension.
It listens for messages from the application and sends them to the background service.
*/

// Notify the page that the Otter Devtools extension is ready
window.postMessage({
  type: 'otter',
  to: 'app',
  content: {
    dataType: 'connect'
  }
} as OtterMessage<ConnectContentMessage, typeof applicationMessageTarget>, '*');

declare namespace globalThis {
  let localMessageListener: ((this: Window, ev: MessageEvent<any>) => any) | undefined;
}

// Remove previous listener (if the script is reloaded by a previous extension instance)
if (globalThis.localMessageListener) {
  window.removeEventListener('message', globalThis.localMessageListener);
}

/**
 * Listener for messages from the page
 * @param event
 */
function messageListener(event: MessageEvent<any>) {
  let message: any;
  try {
    message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
  } catch (e) {
    // ignore invalid JSON
    console.warn('Chrome devtool could not parse invalid message', e);
  }
  if (message?.type === 'otter' && message.to !== 'app' && message.content) {
    try {
      void chrome.runtime.sendMessage(message);
    } catch (e) {
      console.warn('Chrome devtool could not send message', e);
      if (globalThis.localMessageListener) {
        window.removeEventListener('message', globalThis.localMessageListener);
      }
    }
  }
}

globalThis.localMessageListener = messageListener;

// Listen for messages from the application
window.addEventListener('message', globalThis.localMessageListener);
