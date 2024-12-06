import {
  DestroyRef,
  inject,
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  DevtoolsServiceInterface,
  filterMessageContent,
  sendOtterMessage,
} from '@o3r/core';
import {
  LoggerService,
} from '@o3r/logger';
import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
} from 'rxjs';
import type {
  DebugEvent,
} from '../engine';
import {
  AvailableRulesEngineMessageContents,
  isRulesEngineMessage,
  RulesEngineDevtoolsServiceOptions,
  RulesEngineMessageDataTypes,
} from './rules-engine-devkit.interface';
import {
  OtterRulesEngineDevtools,
} from './rules-engine-devtools.service';
import {
  OTTER_RULES_ENGINE_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS,
} from './rules-engine-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class RulesEngineDevtoolsMessageService implements DevtoolsServiceInterface {
  private readonly options: RulesEngineDevtoolsServiceOptions;
  private readonly forceEmitRulesEngineReport = new BehaviorSubject<void>(undefined);
  private readonly sendMessage = sendOtterMessage<AvailableRulesEngineMessageContents>;
  private readonly destroyRef = inject(DestroyRef);

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

  private readonly serializeError = (error: any) => error instanceof Error ? error.toString() : error;

  /**
   * Serialize exceptions in a way that will display the error message after a JSON.stringify()
   * @param debugEvent
   */
  private serializeReportEvent(debugEvent: DebugEvent) {
    if (debugEvent.type !== 'RulesetExecutionError') {
      return debugEvent;
    }
    return {
      ...debugEvent,
      rulesEvaluations: debugEvent.rulesEvaluations.map((ruleEvaluation) => ({
        ...ruleEvaluation,
        error: this.serializeError(ruleEvaluation.error)
      })),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- type is explicitly `any`
      errors: debugEvent.errors.map((error) => this.serializeError(error))
    };
  }

  /**
   * Function to start the rules engine reporting to the Otter Chrome DevTools extension
   */
  private startRulesEngineReport() {
    if (this.rulesEngineDevtools.rulesEngineReport$) {
      combineLatest([
        this.forceEmitRulesEngineReport,
        this.rulesEngineDevtools.rulesEngineReport$
      ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        ([,report]) => {
          const sanitizedReport = { ...report, events: report.events.map((reportEvents) => this.serializeReportEvent(reportEvents)) };
          this.sendMessage('rulesEngineEvents', sanitizedReport);
        }
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

    fromEvent(window, 'message').pipe(
      takeUntilDestroyed(this.destroyRef),
      filterMessageContent(isRulesEngineMessage)
    ).subscribe((e) => this.handleEvents(e));
  }
}
