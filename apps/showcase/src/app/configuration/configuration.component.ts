import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, QueryList, signal, ViewChildren, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApplicationDevtoolsModule } from '@o3r/application';
import { ComponentsDevtoolsModule } from '@o3r/components';
import { ConfigurationBaseServiceModule, ConfigurationDevtoolsMessageService, ConfigurationDevtoolsModule } from '@o3r/configuration';
import { O3rComponent } from '@o3r/core';
import { ConfigurationPresComponent, CopyTextPresComponent, IN_PAGE_NAV_PRES_DIRECTIVES, InPageNavLink, InPageNavLinkDirective, InPageNavPresService } from '../../components/index';
import { ConfigurationPresConfig } from '../../components/showcase/configuration/configuration-pres.config';

const CONFIG_OVERRIDE: ConfigurationPresConfig = {
  inXDays: 30,
  destinations: [
    { cityName: 'Manchester', available: true },
    { cityName: 'Nice', available: true },
    { cityName: 'Dallas', available: true }
  ],
  shouldProposeRoundTrip: true
};

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-configuration',
  standalone: true,
  imports: [
    RouterModule,
    ConfigurationPresComponent,
    ApplicationDevtoolsModule,
    ComponentsDevtoolsModule,
    ConfigurationDevtoolsModule,
    ConfigurationBaseServiceModule,
    CopyTextPresComponent,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe
  ],
  templateUrl: './configuration.template.html',
  styleUrls: ['./configuration.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationComponent implements AfterViewInit {
  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  public config = signal<ConfigurationPresConfig | undefined>(undefined);

  public codeConfig = computed(() => {
    const config = this.config();
    return config
      ? `<o3r-configuration-pres
  [config]="${JSON.stringify(config, null, 2)}"
></o3r-configuration-pres>`
      : '<o3r-configuration-pres></o3r-configuration-pres>';
  });

  constructor(
    private readonly inPageNavPresService: InPageNavPresService,
    configurationDevtoolsMessageService: ConfigurationDevtoolsMessageService
  ) {
    configurationDevtoolsMessageService.activate();
  }

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }

  public toggleConfig() {
    this.config.update((c) => !c ? CONFIG_OVERRIDE : undefined);
  }
}
