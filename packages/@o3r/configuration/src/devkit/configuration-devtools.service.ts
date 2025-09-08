import {
  ApplicationRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  select,
  Store,
} from '@ngrx/store';
import {
  computeItemIdentifier,
  Configuration,
  CustomConfig,
} from '@o3r/core';
import {
  firstValueFrom,
  Observable,
} from 'rxjs';
import {
  filter,
  map,
  shareReplay,
} from 'rxjs/operators';
import {
  parseConfigurationName,
} from '../core';
import {
  computeConfiguration,
  ConfigurationModel,
  ConfigurationStore,
  selectConfigurationEntities,
  selectConfigurationIds,
  upsertConfigurationEntities,
  upsertConfigurationEntity,
} from '../stores';
import {
  ConfigurationDevtoolsServiceOptions,
} from './configuration-devtools.interface';
import {
  OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS,
  OTTER_CONFIGURATION_DEVTOOLS_OPTIONS,
} from './configuration-devtools.token';

@Injectable({ providedIn: 'root' })
export class OtterConfigurationDevtools {
  protected store = inject<Store<ConfigurationStore>>(Store);
  private readonly appRef = inject(ApplicationRef);
  private readonly options = inject<ConfigurationDevtoolsServiceOptions>(OTTER_CONFIGURATION_DEVTOOLS_OPTIONS, { optional: true }) ?? OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS;

  /** Stream of configurations */
  public readonly configurationEntities$: Observable<CustomConfig[]>;

  constructor() {
    const options = this.options;

    this.options = { ...OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS, ...options };

    /** Full configuration store */
    this.configurationEntities$ = this.store.pipe(
      select(selectConfigurationEntities),
      map((entities) =>
        Object.values(entities)
          .filter((entity): entity is ConfigurationModel => !!entity)
          .map((entity) => {
            const { id, ...config } = entity;
            const { library = this.options.defaultLibraryName, componentName: name = id } = parseConfigurationName(id) || {};
            return { name, config, library } satisfies CustomConfig;
          })
      ),
      shareReplay(1)
    );
  }

  /**
   * Get configuration name based on input information
   * @param selector Selector for a component configuration. It can be a string in the form library#componentName (i.e: @my-lib/shared-components#HeaderContComponent)
   * or an object with the component and library names (i.e: {library:"@my-lib/shared-components", componentName:'HeaderContComponent'})
   * @param isFallbackName Determine if the name requested is a fallback name
   * @returns string in the format library#componentName (i.e: "@my-lib/shared-components#HeaderContComponent")
   */
  public getComponentConfigName(selector: string | { library?: string; componentName: string }, isFallbackName = false) {
    if (!isFallbackName) {
      return typeof selector === 'string' ? selector : computeItemIdentifier(selector.componentName, selector.library || this.options.defaultLibraryName);
    }

    return typeof selector === 'string'
      ? computeItemIdentifier(selector, this.options.defaultLibraryName || 'global')
      : computeItemIdentifier(selector.componentName, this.options.defaultLibraryName || 'global');
  }

  /**
   * Get the list of components which have a configuration loaded in the store
   */
  public getComponentsWithConfiguration(): Promise<string[]> {
    return firstValueFrom(
      this.store
        .pipe(
          select(selectConfigurationIds),
          map((ids) => ids
            .map((configName) => parseConfigurationName(configName.toString()))
            .filter((parsedName): parsedName is { library?: string; componentName: string } => !!parsedName)
            .map((parsedName) => parsedName.componentName + (parsedName.library ? ' from ' + parsedName.library : ''))
          )
        )
    );
  }

  /**
   * Set a specified value of a component configuration
   * @param selector Selector for a component configuration
   * @param configProperty Name of the configuration property to set
   * @param configValue Value of the configuration property to set
   */
  public setDynamicConfig(selector: string | { library?: string; componentName: string }, configProperty: string, configValue: any): void {
    this.store.dispatch(
      upsertConfigurationEntity({
        id: this.getComponentConfigName(selector),
        configuration: { [configProperty]: configValue }
      })
    );
    this.appRef.tick();
  }

  /**
   * Get the configuration for a specific component
   * @param selector Selector for a component configuration. It can be a string in the form library#configurationName (i.e: @my-lib/shared-components#HeaderPresConfig)
   * or an object with the configuration and library names (i.e: {library:"@my-lib/shared-components", componentName:'HeaderPresConfig'})
   */
  public getCurrentConfigurationFor(selector: string | { library?: string; componentName: string }): Promise<Configuration> {
    return firstValueFrom(
      this.store.pipe(
        select(selectConfigurationEntities),
        map((entities) => entities[this.getComponentConfigName(selector)] || entities[this.getComponentConfigName(selector, true)]),
        filter((entity): entity is ConfigurationModel => !!entity),
        map((entity) => {
          const { id, ...configuration } = entity;
          return configuration as Configuration;
        })
      )
    );
  }

  /**
   * Get the whole configuration of the application
   */
  public getConfiguration() {
    return firstValueFrom(this.configurationEntities$);
  }

  /**
   * Load a json configuration
   * @param configurations configurations to load
   */
  public loadConfiguration(configurations: string | CustomConfig<Configuration>[]): void {
    this.store.dispatch(upsertConfigurationEntities(computeConfiguration(typeof configurations === 'string' ? JSON.parse(configurations) : configurations)));
    this.appRef.tick();
  }
}
