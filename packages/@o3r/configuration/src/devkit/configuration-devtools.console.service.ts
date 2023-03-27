/* eslint-disable no-console */
import { Inject, Injectable, Optional } from '@angular/core';
import type { Configuration, CustomConfig, DevtoolsServiceInterface, WindowWithDevtools } from '@o3r/core';
import { firstValueFrom } from 'rxjs';
import { ConfigurationDevtoolsServiceOptions } from './configuration-devtools.interface';
import { OtterConfigurationDevtools } from './configuration-devtools.service';
import { OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS, OTTER_CONFIGURATION_DEVTOOLS_OPTIONS } from './configuration-devtools.token';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationDevtoolsConsoleService implements DevtoolsServiceInterface {

  /** Name of the Window property to access to the devtools */
  public static readonly windowModuleName = 'configuration';

  constructor(
    private configurationDevtools: OtterConfigurationDevtools,
    @Optional() @Inject(OTTER_CONFIGURATION_DEVTOOLS_OPTIONS) private readonly options: ConfigurationDevtoolsServiceOptions
  ) {
    this.options = { ...OTTER_CONFIGURATION_DEVTOOLS_DEFAULT_OPTIONS, ...options };

    if (this.options.isActivatedOnBootstrap) {
      this.activate();
    }
  }

  private downloadJSON(content: string, fileName: string = this.options.defaultJsonFilename): void {
    const a = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  private copyElementToClipboard(content: string): void {
    const input = document.createElement('textarea');
    input.value = content;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }

  /**
   * Set a specified value of a component configuration
   *
   * @param selector Selector for a component configuration
   * @param configProperty Name of the configuration property to set
   * @param configValue Value of the configuration property to set
   */
  public setDynamicConfig(selector: string | { library?: string; componentName: string }, configProperty: string, configValue: any): void {
    this.configurationDevtools.setDynamicConfig(selector, configProperty, configValue);
  }

  /** @inheritDoc */
  public activate() {
    const windowWithDevtools: WindowWithDevtools = window;
    // eslint-disable-next-line no-underscore-dangle
    windowWithDevtools._OTTER_DEVTOOLS_ ||= {};
    // eslint-disable-next-line no-underscore-dangle
    windowWithDevtools._OTTER_DEVTOOLS_[ConfigurationDevtoolsConsoleService.windowModuleName] = this;

    console.info(`Otter Configuration Devtools is now accessible via the _OTTER_DEVTOOLS_.${ConfigurationDevtoolsConsoleService.windowModuleName} variable`);
  }

  /**
   * Display the list of configurations loaded in the store and the library they originate from
   *
   * @returns array with the configurations and libraries for example: ["RefxComponentsCommonRuntimeConfig from @refx/shared-common"]
   */
  public async displayComponentsWithConfiguration() {
    const selectors = await this.configurationDevtools.getComponentsWithConfiguration();
    console.log(selectors);
  }

  /**
   * Display the configuration for a specific component
   *
   * @param selector Selector for a component configuration. It can be a string in the form library#configurationName (i.e: '@refx/shared-components#HeaderContConfig')
   * or an object with the configuration and library names (i.e: {library:"@refx/shared-components", componentName:'HeaderContConfig'}).
   * Note the object input componentName expects a configuration name not a component name.
   * @returns Configuration object (i.e: {airlineLogoPath: "img/airlines/icon-BH.svg", displayLanguageSelector: false})
   */
  public async displayCurrentConfigurationFor(selector: string | { library?: string; componentName: string }) {
    const configuration = await this.configurationDevtools.getCurrentConfigurationFor(selector);
    console.log(configuration);
  }

  /**
   * Download the JSON file of the whole configuration
   *
   * @param fileName Name of the file to download
   */
  public async saveConfiguration(fileName: string = this.options.defaultJsonFilename) {
    const configs = await firstValueFrom(this.configurationDevtools.configurationEntities$);
    this.downloadJSON(JSON.stringify(configs), fileName);
  }

  /**
   * Display the whole configuration of the application
   */
  public async displayConfiguration() {
    const configs = await this.configurationDevtools.getConfiguration();
    console.log(configs);
  }

  /**
   * Display a bookmark to generate the current configuration
   */
  public async displayConfigurationBookmark() {
    const content = await this.configurationDevtools.getConfiguration();

    console.log('BOOKMARK');
    console.log(`javascript:window._OTTER_DEVTOOLS_.loadConfiguration('${JSON.stringify(content).replace(/[']/g, '\\\'')}')`);
  }

  /**
   * Copy the whole configuration to the clipboard
   */
  public async copyConfigurationToClipboard() {
    const configs = await firstValueFrom(this.configurationDevtools.configurationEntities$);
    this.copyElementToClipboard(JSON.stringify(configs));
  }

  /**
   * Load a json configuration
   *
   * @param configurations configurations to load
   */
  public loadConfiguration(configurations: string | CustomConfig<Configuration>[]): void {
    this.configurationDevtools.loadConfiguration(configurations);
  }
}
