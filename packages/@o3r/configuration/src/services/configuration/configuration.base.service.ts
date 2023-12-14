import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Configuration, CustomConfig, deepFill } from '@o3r/core';
import { combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { ConfigOverrideStore, selectComponentOverrideConfig } from '../../stores/config-override/index';
import {
  computeConfiguration,
  ConfigurationStore,
  globalConfigurationId,
  selectConfigurationEntities,
  selectConfigurationForComponent,
  selectGlobalConfiguration,
  updateConfigurationEntity,
  upsertConfigurationEntities,
  upsertConfigurationEntity
} from '../../stores/index';
import { ConfigurationBaseServiceModule } from './configuration.base.module';

const jsonStringifyDiff = (obj1: any, obj2: any) => JSON.stringify(obj1) === JSON.stringify(obj2);

/**
 * Configuration service
 */
@Injectable({
  providedIn: ConfigurationBaseServiceModule
})
export class ConfigurationBaseService {

  private readonly extendedConfiguration: {[key: string]: boolean} = {};

  constructor(private readonly store: Store<ConfigurationStore & ConfigOverrideStore>) {
  }

  /**
   * Update a specific component config or add it to the store if does not exist
   * @param configuration to edit/add
   * @param configurationId Configuration ID
   */
  public upsertConfiguration<T extends Configuration>(configuration: T, configurationId = globalConfigurationId) {
    this.store.dispatch(upsertConfigurationEntity({id: configurationId, configuration}));
  }

  /**
   * Update a specific component config
   * @param configuration Partial config to edit
   * @param configurationId Configuration ID
   */
  public updateConfiguration<T extends Partial<Configuration>>(configuration: T, configurationId = globalConfigurationId) {
    this.store.dispatch(updateConfigurationEntity({id: configurationId, configuration}));
  }

  /**
   * This function will get the configuration stored in the data attribute of the html's body tag
   * @param configTagName Value used to identify the data attribute where the config is pushed in the index.html
   */
  public getConfigFromBodyTag<T extends Configuration>(configTagName = 'staticconfig') {
    const bootstrapConfigString = document.body.dataset[configTagName];
    const customConfigObject: CustomConfig<T>[] = bootstrapConfigString ? JSON.parse(bootstrapConfigString) : [];
    if (customConfigObject.length) {
      this.computeConfiguration(customConfigObject);
    }
  }

  /**
   * Transform the custom configuration in store configuration model
   * @param customConfigObject Configuration object (extracted from body tag for static config or downloaded in case of dynamic config)
   */
  public computeConfiguration<T extends Configuration>(customConfigObject: CustomConfig<T>[]) {
    this.store.dispatch(upsertConfigurationEntities(computeConfiguration(customConfigObject)));
  }

  /**
   * Complete a stored configuration by adding the missing fields
   * @param extension Configuration extension to be included in the store
   * @param configurationId Configuration ID to extend
   * @param forceUpdate Force update the configuration in the store
   */
  public extendConfiguration<T extends Configuration>(extension: T, configurationId = globalConfigurationId, forceUpdate = false) {
    if (this.extendedConfiguration[configurationId] && !forceUpdate) {
      return;
    }
    this.extendedConfiguration[configurationId] = true;
    this.store.pipe(
      select(selectConfigurationEntities),
      take(1),
      map((storedConfigs) => configurationId in storedConfigs ? deepFill(extension, storedConfigs[configurationId]) : extension)
    ).subscribe((extendedConfig) => this.upsertConfiguration(extendedConfig, configurationId));
  }

  /**
   * Operator to get the configuration from store for a given component and merge it with the global config
   * @param id Id of the component
   * @param defaultValue Default value of the configuration
   */
  public getComponentConfig<T extends Configuration>(id: string, defaultValue: T) {
    return (source: Observable<Partial<T> | undefined>): Observable <T> => {
      const componentConfigurationFromStore$ = this.getConfig(id) as Observable<T>;

      return source.pipe(
        switchMap((overrideConfig) => componentConfigurationFromStore$.pipe(
          map((componentConfigurationFromStore) => {
            const config = componentConfigurationFromStore ? deepFill(defaultValue, componentConfigurationFromStore) : defaultValue;
            return overrideConfig ? deepFill(config, overrideConfig) : config;
          })
        ))
      );
    };
  }

  /**
   * Get an observable of the configuration from store for a given component and merge it with the global config + the config overrides from the rules engine
   * @param id Id of the component
   */
  public getConfig(id: string): Observable<any> {
    const globalConfig$ = this.store.pipe(select(selectGlobalConfiguration));
    const componentConfig$ = id !== globalConfigurationId ? this.store.pipe(select(selectConfigurationForComponent({ id }))) : of({});
    const overrideConfig$ = this.store.pipe(select(selectComponentOverrideConfig(id)));

    return combineLatest([globalConfig$, componentConfig$, overrideConfig$]).pipe(
      map(([globalConfig, componentConfig, overrideConfig]) => ({ ...globalConfig, ...componentConfig, ...overrideConfig })),
      distinctUntilChanged(jsonStringifyDiff)
    );
  }
}
