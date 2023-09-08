import { registerLocaleData } from '@angular/common';
import localeEN from '@angular/common/locales/en';
import localeFR from '@angular/common/locales/fr';
import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { RuntimeChecks, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateCompiler, TranslateModule } from '@ngx-translate/core';
import { prefersReducedMotion } from '@o3r/application';
import {
  LocalizationConfiguration,
  LocalizationModule,
  MESSAGE_FORMAT_CONFIG,
  translateLoaderProvider,
  TranslateMessageFormatLazyCompiler
} from '@o3r/localization';
import { RulesEngineModule } from '@o3r/rules-engine';
import { SidenavPresComponent } from '../components/index';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

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
    useDynamicContent: !isDevMode()
  };
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
    RulesEngineModule.forRoot({ debug: isDevMode() }),
    AppRoutingModule,
    SidenavPresComponent
  ],
  providers: [
    {provide: MESSAGE_FORMAT_CONFIG, useValue: {}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
