import {
  AsyncPipe,
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  RouterModule,
} from '@angular/router';
import {
  configSignal,
  ConfigurationBaseServiceModule,
  DynamicConfigurableWithSignal,
  O3rConfig,
} from '@o3r/configuration';
import {
  O3rComponent,
} from '@o3r/core';
import {
  MarkdownModule,
} from 'ngx-markdown';
import {
  ConfigurationPres,
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
} from '../../components/index';
import {
  ConfigurationPresConfig,
} from '../../components/showcase/configuration/configuration-pres-config';
import {
  CONFIGURATION_CONFIG_ID,
  CONFIGURATION_DEFAULT_CONFIG,
  type ConfigurationConfig,
} from './configuration-config';

const CONFIG_OVERRIDE = {
  inXDays: 30,
  destinations: [
    { cityName: 'Manchester', available: true },
    { cityName: 'Nice', available: true },
    { cityName: 'Dallas', available: true }
  ],
  shouldProposeRoundTrip: true
} as const satisfies ConfigurationPresConfig;

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-configuration',
  imports: [
    RouterModule,
    ConfigurationPres,
    ConfigurationBaseServiceModule,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe,
    MarkdownModule
  ],
  templateUrl: './configuration.html',
  styleUrls: ['./configuration.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Configuration implements DynamicConfigurableWithSignal<ConfigurationConfig>, AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly inPageNavLinkDirectives = viewChildren<InPageNavLink>(InPageNavLinkDirective);

  public links$ = this.inPageNavPresService.links$;

  /** Input configuration to override the default configuration of the component */
  public config = input<Partial<ConfigurationConfig>>();
  /** Configuration signal based on the input and the stored configuration */
  @O3rConfig()
  public configSignal = configSignal(
    this.config,
    CONFIGURATION_CONFIG_ID,
    CONFIGURATION_DEFAULT_CONFIG
  );

  public configOverride = signal<ConfigurationPresConfig | undefined>(undefined);

  public codeConfig = computed(() => {
    const config = this.configOverride();
    return config
      ? `<o3r-configuration-pres
  [config]="${JSON.stringify(config, null, 2)}"
></o3r-configuration-pres>`
      : '<o3r-configuration-pres></o3r-configuration-pres>';
  });

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives());
  }

  public toggleConfig() {
    this.configOverride.update((c) => c ? undefined : CONFIG_OVERRIDE);
  }
}
