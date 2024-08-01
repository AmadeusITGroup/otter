import {ApiClient, ApiFetchClient} from '@ama-sdk/core';
import {PetApi} from '@ama-sdk/showcase-sdk';
import { registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import localeFR from '@angular/common/locales/fr';
import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap';
import { EffectsModule } from '@ngrx/effects';
import { RuntimeChecks, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateCompiler, TranslateModule } from '@ngx-translate/core';
import { ApplicationDevtoolsModule, OTTER_APPLICATION_DEVTOOLS_OPTIONS, prefersReducedMotion } from '@o3r/application';
import { ConfigurationDevtoolsModule, OTTER_CONFIGURATION_DEVTOOLS_OPTIONS } from '@o3r/configuration';
import { C11nModule, ComponentsDevtoolsModule, OTTER_COMPONENTS_DEVTOOLS_OPTIONS, registerCustomComponent } from '@o3r/components';
// import {MonacoEditorModule} from 'ngx-monaco-editor-v2';
import {
  LocalizationConfiguration,
  LocalizationDevtoolsModule,
  LocalizationModule,
  MESSAGE_FORMAT_CONFIG,
  OTTER_LOCALIZATION_DEVTOOLS_OPTIONS,
  translateLoaderProvider,
  TranslateMessageFormatLazyCompiler
} from '@o3r/localization';
import { ConsoleLogger, Logger, LOGGER_CLIENT_TOKEN, LoggerService } from '@o3r/logger';
import { OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, RulesEngineRunnerModule } from '@o3r/rules-engine';
import { OTTER_STYLING_DEVTOOLS_OPTIONS, StylingDevtoolsModule } from '@o3r/styling';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { DatePickerHebrewInputPresComponent, ScrollBackTopPresComponent, SidenavPresComponent } from '../components/utilities/index';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {NGX_MONACO_EDITOR_CONFIG} from "ngx-monaco-editor-v2";


const runtimeChecks: Partial<RuntimeChecks> = {
  strictActionImmutability: false,
  strictActionSerializability: false,
  strictActionTypeUniqueness: !isDevMode(),
  strictActionWithinNgZone: !isDevMode(),
  strictStateImmutability: !isDevMode(),
  strictStateSerializability: false
};

registerLocaleData(localeEN, 'en-GB');
registerLocaleData(localeFR, 'fr-FR');

function petApiFactory(logger: Logger) {
  const apiConfig: ApiClient = new ApiFetchClient(
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
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'en-US': 'en-GB'
    },
    fallbackLanguage: 'en-GB',
    bundlesOutputPath: 'localizations/',
    useDynamicContent: !isDevMode(),
    enableTranslationDeactivation: true
  };
}

/**
 * Factory function to register custom components
 */
export function registerCustomComponents(): Map<string, any> {
  return registerCustomComponent(new Map(), 'exampleDatePickerFlavorHebrew', DatePickerHebrewInputPresComponent);
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule.withConfig({disableAnimations: prefersReducedMotion()}),
    EffectsModule.forRoot([]),
    StoreModule.forRoot({}, { runtimeChecks }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    TranslateModule.forRoot({
      loader: translateLoaderProvider,
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatLazyCompiler
      }
    }),
    LocalizationModule.forRoot(localizationConfigurationFactory),
    RulesEngineRunnerModule.forRoot({ debug: true }),
    AppRoutingModule,
    SidenavPresComponent,
    NgbOffcanvasModule,
    ScrollBackTopPresComponent,
    ApplicationDevtoolsModule,
    ComponentsDevtoolsModule,
    C11nModule.forRoot({registerCompFunc: registerCustomComponents}),
    StylingDevtoolsModule,
    LocalizationDevtoolsModule,
    ConfigurationDevtoolsModule,
    // MonacoEditorModule.forRoot()
  ],
  providers: [
    {provide: MESSAGE_FORMAT_CONFIG, useValue: {}},
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          bash: () => import('highlight.js/lib/languages/bash'),
          css: () => import('highlight.js/lib/languages/css'),
          json: () => import('highlight.js/lib/languages/json'),
          typescript: () => import('highlight.js/lib/languages/typescript'),
          xml: () => import('highlight.js/lib/languages/xml')
        }
      }
    },
    {provide: LOGGER_CLIENT_TOKEN, useValue: new ConsoleLogger()},
    {provide: PetApi, useFactory: petApiFactory, deps: [LoggerService]},
    {provide: OTTER_CONFIGURATION_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true}},
    {provide: OTTER_LOCALIZATION_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true}},
    {provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true}},
    {provide: OTTER_COMPONENTS_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true}},
    {provide: OTTER_APPLICATION_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true, appName: 'showcase'}},
    {provide: OTTER_STYLING_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true}},
    {provide: NGX_MONACO_EDITOR_CONFIG, useValue: {}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
