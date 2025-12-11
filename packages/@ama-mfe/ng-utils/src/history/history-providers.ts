import {
  HistoryMessage,
  HistoryV1_0,
} from '@ama-mfe/messages';
import {
  MessagePeerService,
} from '@amadeus-it-group/microfrontends-angular';
import {
  inject,
  provideAppInitializer,
} from '@angular/core';

/**
 * Provides necessary overrides to make the module navigation in history work in an embedded context :
 * - Prevent pushing states to history, replace state instead
 * - Handle history navigation via History messages to let the host manage the states
 */
export function provideHistoryOverrides() {
  return provideAppInitializer(() => {
    const messageService = inject(MessagePeerService<HistoryMessage>);
    const navigate = (delta: number) => {
      messageService.send({
        type: 'history',
        version: '1.0',
        delta
      } satisfies HistoryV1_0);
    };
    Object.defineProperty(history, 'pushState', {
      value: (data: any, unused: string, url?: string | URL | null) => {
        history.replaceState(data, unused, url);
      },
      writable: false,
      configurable: false
    });
    Object.defineProperty(history, 'back', {
      value: () => navigate(-1),
      writable: false,
      configurable: false
    });
    Object.defineProperty(history, 'forward', {
      value: () => navigate(1),
      writable: false,
      configurable: false
    });
    Object.defineProperty(history, 'go', {
      value: (delta: number) => navigate(delta),
      writable: false,
      configurable: false
    });
  });
}
