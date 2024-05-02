import type { InjectContentMessage, OtterMessage, otterMessageType } from '@o3r/core';
import type { scriptToInject as ScriptToInject } from '../services/connection.service';
import type { ExtensionMessage } from './interface';

/** Type of a message exchanged with the Otter Chrome DevTools extension */
const postMessageType: typeof otterMessageType = 'otter';

const scriptToInject: typeof ScriptToInject = 'extension/wrap.js';

/**
 * determine if the message is an OtterDebugMessage
 * @param message
 */
const isOtterDebugMessage = (message: any): message is OtterMessage => {
  return message?.type === postMessageType;
};

/**
 * determine if the message is an ExtensionMessage
 * @param message
 */
const isExtensionMessage = (message: any): message is ExtensionMessage => {
  return typeof message?.tabId !== 'undefined';
};

/**
 * determine if the message content is an InjectContentMessage
 * @param content
 */
const isInjectionContentMessage = (content: any): content is InjectContentMessage => {
  return content?.dataType === 'inject';
};

/** map of connection base on Tab ID */
const connections = new Map<number, chrome.runtime.Port[]>();

chrome.runtime.onConnect.addListener((port) => {
  let tabId: number | undefined;
  // assign the listener function to a variable so we can remove it later
  const devToolsListener = async (message: any) => {
    // reject all messages not coming from the devtools
    if (!isOtterDebugMessage(message) || !isExtensionMessage(message)) {
      return console.warn('Unknown message', message);
    }

    const content = message.content;
    // Inject script if the connection is requested by a devtools instance
    if (isInjectionContentMessage(content)) {
      tabId = message.tabId;
      const ports = connections.get(tabId);
      if (ports) {
        connections.set(tabId, ports.concat(port));
      } else {
        connections.set(tabId, [port]);
      }
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [content.scriptToInject]
      });

    // forward all other messages to the application
    } else {
      tabId = message.tabId;
      await chrome.scripting.executeScript({
        target: { tabId },
        args: [content, postMessageType],
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions, @typescript-eslint/no-shadow
        func: function (content, postMessageType) {
          window.postMessage({
            type: postMessageType,
            to: 'app',
            content
          }, '*');
        }
      });
    }
  };
  // add the listener
  port.onMessage.addListener(devToolsListener);

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(devToolsListener);
    if (tabId) {
      const ports = connections.get(tabId);
      if (ports) {
        const newPorts = ports.filter(p => p !== port);
        if (newPorts.length) {
          connections.set(tabId, newPorts);
        } else {
          connections.delete(tabId);
        }
      }
    }
  });
});

// Listen for messages from the application
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.tab?.id && connections.has(sender.tab.id) && isOtterDebugMessage(request)) {
    // Redirect the message to the correct devtool instance (if any)
    connections.get(sender.tab.id)!.forEach((port) => port.postMessage(request));
    return sendResponse(true);
  }
  return sendResponse(false);
});

chrome.webNavigation.onCommitted.addListener(async ({ tabId, transitionType }) => {
  if (transitionType === 'reload' && connections.has(tabId)) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [scriptToInject]
    });
  }
});
