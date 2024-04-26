import { ModuleWithProviders, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { PlaceholderTemplateStoreModule } from '../stores/placeholder-template/placeholder-template.module';
import type { ComponentsDevtoolsServiceOptions } from './components-devkit.interface';
import { ComponentsDevtoolsMessageService } from './components-devtools.message.service';
import { OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS, OTTER_COMPONENTS_DEVTOOLS_OPTIONS } from './components-devtools.token';

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
        { provide: OTTER_COMPONENTS_DEVTOOLS_OPTIONS, useValue: {...OTTER_COMPONENTS_DEVTOOLS_DEFAULT_OPTIONS, ...options}, multi: false },
        ComponentsDevtoolsMessageService
      ]
    };
  }
}
