import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  StoreModule,
} from '@ngrx/store';
import {
  PlaceholderTemplateStoreModule,
  providePlaceholderTemplateStore,
} from '../stores/placeholder-template/placeholder-template-module';
import type {
  ComponentsDevtoolsServiceOptions,
} from './components-devkit-interface';
import {
  ComponentsDevtoolsMessageService,
} from './components-devtools-message-service';
import {
  OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_COMPONENTS_DEVTOOLS_OPTIONS,
} from './components-devtools-token';

/**
 * @deprecated Will be removed in v16. Use {@link provideComponentsDevtools} instead.
 */
@NgModule({
  imports: [
    StoreModule,
    PlaceholderTemplateStoreModule
  ],
  providers: [
    { provide: OTTER_COMPONENTS_DEVTOOLS_OPTIONS, useValue: OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS },
    ComponentsDevtoolsMessageService
  ]
})
export class ComponentsDevtoolsModule {
  /**
   * Initialize Otter Devtools
   * @param options
   */
  public static instrument(options: Partial<ComponentsDevtoolsServiceOptions>): ModuleWithProviders<ComponentsDevtoolsModule> {
    return {
      ngModule: ComponentsDevtoolsModule,
      providers: [
        { provide: OTTER_COMPONENTS_DEVTOOLS_OPTIONS, useValue: { ...OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS, ...options }, multi: false },
        ComponentsDevtoolsMessageService
      ]
    };
  }
}

/**
 * Provide components devtools functionality.
 * @param options Components devtools options
 */
export function provideComponentsDevtools(options?: Partial<ComponentsDevtoolsServiceOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    providePlaceholderTemplateStore(),
    { provide: OTTER_COMPONENTS_DEVTOOLS_OPTIONS, useValue: { ...OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS, ...options } },
    ComponentsDevtoolsMessageService
  ]);
}
