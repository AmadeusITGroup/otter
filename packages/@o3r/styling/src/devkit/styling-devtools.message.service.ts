/* eslint-disable no-console -- this is the purpose of this service */
import {
  DestroyRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  filterMessageContent,
  sendOtterMessage,
} from '@o3r/core';
import {
  LoggerService,
} from '@o3r/logger';
import {
  fromEvent,
} from 'rxjs';
import {
  AvailableStylingMessageContents,
  StylingDevtoolsServiceOptions,
  StylingMessageDataTypes,
} from './styling-devkit.interface';
import {
  OtterStylingDevtools,
} from './styling-devtools.service';
import {
  OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_STYLING_DEVTOOLS_OPTIONS,
} from './styling-devtools.token';

const isStylingMessage = (message: any): message is AvailableStylingMessageContents => {
  return message && (
    message.dataType === 'updateStylingVariables'
    || message.dataType === 'resetStylingVariables'
    || message.dataType === 'getStylingVariable'
    || message.dataType === 'requestMessages'
    || message.dataType === 'connect'
  );
};

const getCSSRulesAppliedOnRoot = () => Array.from(document.styleSheets)
  .reverse()
  .reduce((acc: CSSStyleRule[], styleSheet) => {
    let rules;
    try {
      rules = styleSheet.cssRules || styleSheet.rules;
    } catch (err) {
      console.debug(`Could not access to stylesheet ${styleSheet.href}. This might be due to network issues, please check:
- network connectivity
- CORS setup
- granted access to the stylesheet`, err);
    }

    return acc.concat(
      Array.from(rules || [])
        .reverse()
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && /\b:root\b/.test(rule.selectorText))
    );
  }, []);

const getCSSVariableValueInCSSStyleDeclaration = (variableName: string, style: CSSStyleDeclaration) =>
  style.getPropertyValue(variableName).trim();

const getCSSVariableValue = (variableName: string, cssRules: CSSStyleRule[]) => {
  const inlineValue = getCSSVariableValueInCSSStyleDeclaration(variableName, document.querySelector('html')!.style);
  if (inlineValue) {
    return inlineValue;
  }

  for (const rule of cssRules) {
    const ruleValue = getCSSVariableValueInCSSStyleDeclaration(variableName, rule.style);
    if (ruleValue) {
      return ruleValue;
    }
  }
};

/**
 * Service to handle communication between application and chrome extension for styling
 */
@Injectable()
export class StylingDevtoolsMessageService {
  private readonly logger = inject(LoggerService);
  private readonly stylingDevTools = inject(OtterStylingDevtools);
  private readonly options = inject<StylingDevtoolsServiceOptions>(OTTER_STYLING_DEVTOOLS_OPTIONS, { optional: true }) ?? OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS;

  private readonly sendMessage = sendOtterMessage<AvailableStylingMessageContents>;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.options = {
      ...OTTER_STYLING_DEVTOOLS_DEFAULT_OPTIONS,
      ...this.options
    };
    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  private async sendMetadata() {
    const metadata = await this.stylingDevTools.getStylingMetadata(this.options.stylingMetadataPath);
    const cssRules = getCSSRulesAppliedOnRoot();
    const variables = Object.values(metadata.variables).map((variable) => ({
      ...variable,
      runtimeValue: getCSSVariableValue(`--${variable.name}`, cssRules)
    }));
    this.sendMessage('getStylingVariable', { variables });
  }

  /**
   * Function to trigger a re-send a requested messages to the Otter Chrome DevTools extension
   * @param only restricted list of messages to re-send
   */
  private handleReEmitRequest(only?: StylingMessageDataTypes[]) {
    if (!only || only.includes('getStylingVariable')) {
      return this.sendMetadata();
    }
  }

  /**
   * Function to handle the incoming messages from Otter Chrome DevTools extension
   * @param message Message coming from the Otter Chrome DevTools extension
   */
  private handleEvents(message: AvailableStylingMessageContents) {
    this.logger.debug('Message handling by the styling service', message);

    switch (message.dataType) {
      case 'connect': {
        this.connectPlugin();
        break;
      }
      case 'requestMessages': {
        void this.handleReEmitRequest(message.only);
        break;
      }
      case 'updateStylingVariables': {
        this.stylingDevTools.updateVariables(message.variables);
        break;
      }
      case 'resetStylingVariables': {
        this.stylingDevTools.resetStylingVariables();
        break;
      }
      default: {
        this.logger.warn('Message ignored by the styling service', message);
      }
    }
  }

  /**
   * Function to connect the plugin to the Otter Chrome DevTools extension
   */
  private connectPlugin() {
    this.logger.debug('Otter DevTools is plugged to styling service of the application');
  }

  /** @inheritDoc */
  public activate() {
    fromEvent(window, 'message').pipe(
      takeUntilDestroyed(this.destroyRef),
      filterMessageContent(isStylingMessage)
    ).subscribe((e) => this.handleEvents(e));
  }
}
