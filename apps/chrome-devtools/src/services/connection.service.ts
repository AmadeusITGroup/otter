import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import type { Dictionary } from '@ngrx/entity';
import type { ConfigurationModel } from '@o3r/configuration';
import { otterMessageType } from '@o3r/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import type { AvailableMessageContents } from './message.interface';

import type { ApplicationInformationContentMessage } from '@o3r/application';
import type { SelectedComponentInfoMessage } from '@o3r/components';
import type { ConfigurationsMessage } from '@o3r/configuration';
import type { RulesEngineDebugEventsContentMessage } from '@o3r/rules-engine';

/**
 * Path to the script that is injected into the page.
 */
export const scriptToInject = 'extension/wrap.js';

/**
 * Determine if the message is an ApplicationInformationContentMessage
 *
 * @param data the message
 * @returns true if the message is an ApplicationInformationContentMessage
 */
export const isApplicationInformationMessage = (data?: AvailableMessageContents): data is ApplicationInformationContentMessage => data?.dataType === 'applicationInformation';

/**
 * Determine if the message is a RuleEngineEventsMessage
 *
 * @param data the message
 * @returns true if the message is a RuleEngineEventsMessage
 */
export const isRuleEngineEventsMessage = (data?: AvailableMessageContents): data is RulesEngineDebugEventsContentMessage => data?.dataType === 'rulesEngineEvents';

/**
 * Determine if the message is a ConfigurationsMessage
 *
 * @param data the message
 * @returns true if the message is a ConfigurationsMessage
 */
export const isConfigurationsMessage = (data?: AvailableMessageContents): data is ConfigurationsMessage => data?.dataType === 'configurations';

/**
 * Determine if the message is a SelectedComponentInfoMessage
 *
 * @param data the message
 * @returns true if the message is a SelectedComponentInfoMessage
 */
export const isSelectedComponentInfoMessage = (data?: AvailableMessageContents): data is SelectedComponentInfoMessage => data?.dataType === 'selectedComponentInfo';

/**
 * Service to communicate with the current tab
 */
@Injectable({ providedIn: 'root' })
export class ChromeExtensionConnectionService implements OnDestroy {

  private backgroundPageConnection?: chrome.runtime.Port;
  private messageSubject = new ReplaySubject<AvailableMessageContents>(1);
  private subscription = new Subscription();

  /** Stream of messages received from the service worker */
  public message$ = this.messageSubject.asObservable();

  private configurations = new ReplaySubject<Dictionary<ConfigurationModel>>(1);
  public configurations$ = this.configurations.asObservable();

  constructor(appRef: ApplicationRef) {
    this.subscription.add(this.message$.pipe(debounceTime(100)).subscribe(() => appRef.tick()));
    this.subscription.add(this.message$.pipe(filter(isConfigurationsMessage), map((data) => data.configurations)).subscribe((configurations) => this.configurations.next(configurations)));
  }

  /** Initialize connection to the service worker to dialog with the page */
  public activate() {
    this.backgroundPageConnection = chrome.runtime.connect();
    // eslint-disable-next-line @typescript-eslint/require-await
    this.backgroundPageConnection.onMessage.addListener(async (message) => this.messageSubject.next(message.content));

    this.sendMessage('inject', {scriptToInject});
  }

  /**
   * Send message to the page through the service worker
   *
   * @param dataType
   * @param content
   */
  public sendMessage<T extends AvailableMessageContents>(dataType: T['dataType'], content: Omit<T, 'dataType'>): void {
    this.backgroundPageConnection?.postMessage({
      content: {
        ...content,
        dataType
      },
      tabId: chrome.devtools.inspectedWindow.tabId,
      type: otterMessageType
    });
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.backgroundPageConnection?.disconnect();
    this.subscription.unsubscribe();
  }
}
