import type { applicationMessageTarget, ConnectContentMessage, OtterMessage } from '@o3r/core';
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

// Remove previous listener (if the script is reloaded by a previous extension instance)
if ((globalThis as any).localMessageListener) {
  window.removeEventListener('message', (globalThis as any).localMessageListener);
}

/**
 * Listener for messages from the page
 *
 * @param event
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
(globalThis as any).localMessageListener = function (event: MessageEvent<any>) {
  let message: any;
  try {
    message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
  } catch {
    // ignore invalid JSON
  }
  if (message?.type === 'otter-chrome-devtools' && message.to !== 'app' && message.content) {
    try {
      void chrome.runtime.sendMessage(message);
    } catch {
      window.removeEventListener('message', (globalThis as any).localMessageListener);
    }
  }
};

// Listen for messages from the application
window.addEventListener('message', (globalThis as any).localMessageListener);
