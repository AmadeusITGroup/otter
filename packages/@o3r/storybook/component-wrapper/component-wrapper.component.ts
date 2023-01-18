/*
 * This file contains the component which will wrap otter based components in storybook context
 * The file is in typescript as it needs to be built with the storybook application
 */

import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ConfigurationStore, upsertConfigurationEntity } from '@o3r/configuration';
import { Subscription } from 'rxjs';
import { ComponentWrapperService } from './component-wrapper.service';

/**
 * Component which wraps the component to be displayed in Storybook
 * Used to dispatch an action to update the config store when a config property is changed in Storybook UI
 */
@Component({
  selector: 'o3r-component-wrapper',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ComponentWrapper implements OnDestroy {

  private subscription = new Subscription();

  constructor(store: Store<ConfigurationStore>, wrapper: ComponentWrapperService) {
    this.subscription.add(
      wrapper.configChange$.subscribe((change) => {
        store.dispatch(upsertConfigurationEntity({id: change.componentId, configuration: change.props}));
      })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
