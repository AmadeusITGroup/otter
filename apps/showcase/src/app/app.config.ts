import {
  ApiFetchClient,
} from '@ama-sdk/client-fetch';
import {
  OTTER_STYLING_DEVTOOLS_OPTIONS,
  provideStylingDevtools,
} from '@ama-styling/devkit';
import {
  registerLocaleData,
} from '@angular/common';
import localeEN from '@angular/common/locales/en';
import localeFR from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  isDevMode,
  provideZonelessChangeDetection,
  SecurityContext,
} from '@angular/core';
import {
  provideAnimations,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import {
  provideRouter,
  withHashLocation,
  withInMemoryScrolling,
} from '@angular/router';
import {
  provideTranslocoMessageformat,
} from '@jsverse/transloco-messageformat';
import {
  provideStore,
  RuntimeChecks,
} from '@ngrx/store';
import {
  provideStoreDevtools,
} from '@ngrx/store-devtools';
import {
  OTTER_APPLICATION_DEVTOOLS_OPTIONS,
  prefersReducedMotion,
  provideApplicationDevtools,
} from '@o3r/application';
import {
  OTTER_COMPONENTS_DEVTOOLS_OPTIONS,
  provideComponentsDevtools,
  provideCustomComponents,
  withComponent,
} from '@o3r/components';
import {
  OTTER_CONFIGURATION_DEVTOOLS_OPTIONS,
  provideConfigurationDevtools,
} from '@o3r/configuration';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  ConsoleLogger,
  Logger,
  LOGGER_CLIENT_TOKEN,
  LoggerService,
} from '@o3r/logger';
import {
  OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS,
  provideRulesEngineRunner,
} from '@o3r/rules-engine';
import {
  LocalizationConfiguration,
  OTTER_LOCALIZATION_DEVTOOLS_OPTIONS,
  provideLocalization,
  provideLocalizationDevtools,
} from '@o3r/transloco';
import {
  provideLocalizationRulesEngineAction,
} from '@o3r/transloco/rules-engine';
import {
  PetApi,
} from '@o3r-training/showcase-sdk';
import {
  CLIPBOARD_OPTIONS,
  MARKED_EXTENSIONS,
  provideMarkdown,
  SANITIZE,
} from 'ngx-markdown';
import {
  NGX_MONACO_EDITOR_CONFIG,
  provideMonacoEditor,
} from 'ngx-monaco-editor-v2';
import {
  ClipboardButtonPres,
  DatePickerHebrewInputPres,
} from '../components/utilities';
import {
  markedAlert,
} from '../helpers/marked-alert-extension';
import {
  appRoutes,
} from './app.routes';

const runtimeChecks = {
  strictActionImmutability: false,
  strictActionSerializability: false,
  strictActionTypeUniqueness: !isDevMode(),
  strictActionWithinNgZone: !isDevMode(),
  strictStateImmutability: !isDevMode(),
  strictStateSerializability: false
} as const satisfies Partial<RuntimeChecks>;

registerLocaleData(localeEN, 'en-GB');
registerLocaleData(localeFR, 'fr-FR');

function petApiFactory(logger: Logger) {
  const apiConfig = new ApiFetchClient(
    {
      basePath: 'https://petstore3.swagger.io/api/v3',
      requestPlugins: [],
      fetchPlugins: [],
      logger
    }
  );
  return new PetApi(apiConfig);
}

/**
 * localizationConfigurationFactory
 */
export function localizationConfigurationFactory(): Partial<LocalizationConfiguration> {
  return {
    supportedLocales: ['en-GB', 'fr-FR'],
    fallbackLocalesMap: {

      'en-US': 'en-GB'
    },
    fallbackLanguage: 'en-GB',
    bundlesOutputPath: 'localizations/',
    useDynamicContent: !isDevMode(),
    enableTranslationDeactivation: true
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    ...(prefersReducedMotion() ? [provideNoopAnimations()] : [provideAnimations()]),
    provideRouter(
      appRoutes,
      withHashLocation(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideStore({}, { runtimeChecks }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideRulesEngineRunner({ debug: true }),
    provideLocalizationRulesEngineAction(),
    provideApplicationDevtools(),
    provideComponentsDevtools(),
    provideConfigurationDevtools(),
    provideStylingDevtools(),
    provideMonacoEditor(),
    provideCustomComponents(new Map(), withComponent('exampleDatePickerFlavorHebrew', DatePickerHebrewInputPres)),
    provideDynamicContent(),
    { provide: LOGGER_CLIENT_TOKEN, useValue: new ConsoleLogger() },
    { provide: PetApi, useFactory: petApiFactory, deps: [LoggerService] },
    { provide: OTTER_CONFIGURATION_DEVTOOLS_OPTIONS, useValue: { isActivatedOnBootstrap: true } },
    { provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: { isActivatedOnBootstrap: true } },
    { provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: { isActivatedOnBootstrap: true } },
    { provide: OTTER_COMPONENTS_DEVTOOLS_OPTIONS, useValue: { isActivatedOnBootstrap: true } },
    { provide: OTTER_APPLICATION_DEVTOOLS_OPTIONS, useValue: { isActivatedOnBootstrap: true, appName: 'showcase' } },
    { provide: OTTER_STYLING_DEVTOOLS_OPTIONS, useValue: { isActivatedOnBootstrap: true } },
    provideMarkdown({
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonPres
        }
      },
      markedExtensions: [
        {
          provide: MARKED_EXTENSIONS,
          useFactory: markedAlert,
          multi: true
        }
      ],
      /* Templates are only internal, no need to sanitize */
      sanitize: { provide: SANITIZE, useValue: SecurityContext.NONE }
    }),
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: { baseUrl: `${location.origin}${location.pathname}assets/monaco/min/vs` } },
    provideLocalization(localizationConfigurationFactory),
    provideLocalizationDevtools(),
    provideTranslocoMessageformat()
  ]
};
