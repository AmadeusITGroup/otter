import {
  AsyncPipe,
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  RouterModule,
} from '@angular/router';
import {
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  ApplicationDevtoolsModule,
} from '@o3r/application';
import {
  ComponentsDevtoolsModule,
} from '@o3r/components';
import {
  ConfigOverrideStoreModule,
  ConfigurationBaseServiceModule,
  ConfigurationDevtoolsModule,
} from '@o3r/configuration';
import {
  ConfigurationRulesEngineActionHandler,
  ConfigurationRulesEngineActionModule,
} from '@o3r/configuration/rules-engine';
import {
  O3rComponent,
} from '@o3r/core';
import {
  AssetPathOverrideStoreModule,
  DynamicContentService,
  O3rDynamicContentPipe,
} from '@o3r/dynamic-content';
import {
  AssetRulesEngineActionHandler,
  AssetRulesEngineActionModule,
} from '@o3r/dynamic-content/rules-engine';
import {
  LocalizationOverrideStoreModule,
} from '@o3r/localization';
import {
  LocalizationRulesEngineActionHandler,
  LocalizationRulesEngineActionModule,
} from '@o3r/localization/rules-engine';
import {
  CurrentTimeFactsService,
  dateInNextMinutes,
  Rule,
  RulesEngineDevtoolsModule,
  RulesEngineRunnerModule,
  RulesEngineRunnerService,
  Ruleset,
} from '@o3r/rules-engine';
import {
  MarkdownModule,
} from 'ngx-markdown';
import {
  firstValueFrom,
} from 'rxjs';
import {
  RulesEnginePresComponent,
} from '../../components/showcase/rules-engine/index';
import {
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
} from '../../components/utilities/index';
import {
  environment,
} from '../../environments/environment.development';
import {
  TripFactsService,
} from '../../facts/index';
import {
  duringSummer,
} from '../../operators/index';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-rules-engine',
  imports: [
    RulesEnginePresComponent,
    O3rDynamicContentPipe,
    ConfigurationBaseServiceModule,
    ConfigurationDevtoolsModule,
    ApplicationDevtoolsModule,
    ComponentsDevtoolsModule,
    RulesEngineRunnerModule,
    RulesEngineDevtoolsModule,
    ConfigurationRulesEngineActionModule,
    AssetRulesEngineActionModule,
    LocalizationRulesEngineActionModule,
    ConfigOverrideStoreModule,
    AssetPathOverrideStoreModule,
    LocalizationOverrideStoreModule,
    RouterModule,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    NgbNavModule,
    AsyncPipe,
    MarkdownModule
  ],
  templateUrl: './rules-engine.template.html',
  styleUrls: ['./rules-engine.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesEngineComponent implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly dynamicContentService = inject(DynamicContentService);
  private readonly rulesEngineService = inject(RulesEngineRunnerService);

  public newYorkAvailableRule = '';
  public helloNewYorkRule = '';
  public summerOtterRule = '';
  public lateOtterRule = '';

  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;

  public links$ = this.inPageNavPresService.links$;

  public activeRuleTab = 'configuration';

  constructor() {
    // We recommend to do the next lines in the AppComponent
    // Here we do it for the sake of the example
    this.rulesEngineService.registerActionHandlers(
      inject(ConfigurationRulesEngineActionHandler),
      inject(AssetRulesEngineActionHandler),
      inject(LocalizationRulesEngineActionHandler)
    );
    this.rulesEngineService.engine.upsertOperators([duringSummer]);
    this.rulesEngineService.engine.upsertOperators([dateInNextMinutes]);
    inject(TripFactsService).register();
    const currentTimeFactsService = inject(CurrentTimeFactsService);
    currentTimeFactsService.register();
    currentTimeFactsService.tick();
    void this.loadRuleSet();
  }

  private formatRule(rule: Rule) {
    return {
      ...rule,
      id: '[generated-uuid]'
    };
  }

  private async loadRuleSet() {
    const path = await firstValueFrom(
      this.dynamicContentService.getContentPathStream(
        `${environment.production ? '' : 'assets/'}rules/rulesets.json`
      )
    );

    const resultCall = await fetch(path);
    const result = await resultCall.json() as { rulesets: Ruleset[] };

    this.rulesEngineService.upsertRulesets(result.rulesets);
    const [
      newYorkAvailableRule,
      helloNewYorkRule,
      summerOtterRule,
      lateOtterRule
    ] = result.rulesets[0].rules;
    this.newYorkAvailableRule = JSON.stringify(this.formatRule(newYorkAvailableRule), null, 2);
    this.helloNewYorkRule = JSON.stringify(this.formatRule(helloNewYorkRule), null, 2);
    this.summerOtterRule = JSON.stringify(this.formatRule(summerOtterRule), null, 2);
    this.lateOtterRule = JSON.stringify(this.formatRule(lateOtterRule), null, 2);
  }

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }

  public activateRuleTab(tab: string) {
    this.activeRuleTab = tab;
  }
}
