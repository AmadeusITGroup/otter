import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { DevtoolsServiceInterface, filterMessageContent, sendOtterMessage } from '@o3r/core';
import { LoggerService } from '@o3r/logger';
import { BehaviorSubject, combineLatest, fromEvent, Subscription } from 'rxjs';
import { AvailableRulesEngineMessageContents, RulesEngineDevtoolsServiceOptions, RulesEngineMessageDataTypes } from './rules-engine-devkit.interface';
import { isRulesEngineMessage } from './rules-engine-devkit.interface';
import { OtterRulesEngineDevtools } from './rules-engine-devtools.service';
import { OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS, OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS } from './rules-engine-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class RulesEngineDevtoolsMessageService implements OnDestroy, DevtoolsServiceInterface {
  private readonly options: RulesEngineDevtoolsServiceOptions;

  private readonly subscriptions = new Subscription();

  private readonly forceEmitRulesEngineReport = new BehaviorSubject<void>(undefined);

  private readonly sendMessage = sendOtterMessage<AvailableRulesEngineMessageContents>;

  constructor(
    private readonly rulesEngineDevtools: OtterRulesEngineDevtools,
    private readonly logger: LoggerService,
    @Optional() @Inject(OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS) options?: RulesEngineDevtoolsServiceOptions) {
    this.options = {
      ...OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS,
      ...options
    };

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  /**
   * Function to trigger a re-send a requested messages to the Otter Chrome DevTools extension
   * @param only restricted list of messages to re-send
   */
  private handleReEmitRequest(only?: RulesEngineMessageDataTypes[]) {
    if (!only || only.includes('rulesEngineEvents')) {
      this.forceEmitRulesEngineReport.next();
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
   * @param event Event coming from the Otter Chrome DevTools extension
   * @param message
   */
  private handleEvents(message: AvailableRulesEngineMessageContents) {
    this.logger.debug('Message handling by the configuration service', message);

    switch (message.dataType) {
      case 'connect': {
        this.connectPlugin();
        break;
      }
      case 'requestMessages': {
        this.handleReEmitRequest(message.only);
        break;
      }
      default: {
        this.logger.warn('Message ignored by the configuration service', message);
      }
    }
  }

  /**
   * Function to start the rules engine reporting to the Otter Chrome DevTools extension
   */
  private startRulesEngineReport() {
    if (this.rulesEngineDevtools.rulesEngineReport$) {
      this.subscriptions.add(
        combineLatest([this.forceEmitRulesEngineReport, this.rulesEngineDevtools.rulesEngineReport$]).subscribe(
          ([,report]) => this.sendMessage('rulesEngineEvents', report)
        )
      );
    }
  }

  /**
   * Function to connect the plugin to the Otter DevTools extension
   */
  private connectPlugin() {
    this.logger.info('Otter DevTools is plugged to the application');
    this.forceEmitRulesEngineReport.next();
  }

  /** Activate the Otter DevTools */
  public activate() {
    this.startRulesEngineReport();

    this.subscriptions.add(
      fromEvent(window, 'message').pipe(filterMessageContent(isRulesEngineMessage)).subscribe((e) => this.handleEvents(e))
    );
  }

  /** @inheritDoc */
  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
