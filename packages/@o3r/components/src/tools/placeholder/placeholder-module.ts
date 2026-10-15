import {
  CommonModule,
} from '@angular/common';
import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  NgModule,
} from '@angular/core';
import {
  StoreModule,
} from '@ngrx/store';
import {
  PlaceholderRequestStoreModule,
  providePlaceholderRequestStore,
} from '../../stores/placeholder-request/index';
import {
  PlaceholderTemplateStoreModule,
  providePlaceholderTemplateStore,
} from '../../stores/placeholder-template/index';
import {
  PlaceholderComponent,
} from './placeholder';

/**
 * @deprecated Will be removed in v16. Use {@link providePlaceholder} and import `PlaceholderComponent` directly instead.
 */
@NgModule({
  imports: [
    CommonModule,
    StoreModule,
    PlaceholderTemplateStoreModule,
    PlaceholderRequestStoreModule,
    PlaceholderComponent
  ]
})
export class PlaceholderModule {}

/**
 * Provide placeholder stores required by `PlaceholderComponent`.
 */
export function providePlaceholder(): EnvironmentProviders {
  return makeEnvironmentProviders([
    providePlaceholderTemplateStore(),
    providePlaceholderRequestStore()
  ]);
}
