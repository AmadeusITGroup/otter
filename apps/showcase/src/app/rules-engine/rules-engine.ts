import {
  AsyncPipe,
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  RouterLink,
} from '@angular/router';
import {
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  ConfigurationRulesEngineActionHandler,
} from '@o3r/configuration/rules-engine';
import {
  O3rComponent,
} from '@o3r/core';
import {
  DynamicContentService,
} from '@o3r/dynamic-content';
import {
  AssetRulesEngineActionHandler,
} from '@o3r/dynamic-content/rules-engine';
import {
  CurrentTimeFactsService,
  dateInNextMinutes,
  Rule,
  RulesEngineRunnerService,
  Ruleset,
} from '@o3r/rules-engine';
import {
  LocalizationRulesEngineActionHandler,
} from '@o3r/transloco/rules-engine';
import {
  LanguagePipe,
  MarkdownComponent,
} from 'ngx-markdown';
import {
  firstValueFrom,
} from 'rxjs';
import {
  RulesEnginePres,
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
    RulesEnginePres,
    RouterLink,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    NgbNavModule,
    AsyncPipe,
    LanguagePipe,
    MarkdownComponent
  ],
  templateUrl: './rules-engine.html',
  styleUrls: ['./rules-engine.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesEngine implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly dynamicContentService = inject(DynamicContentService);
  private readonly rulesEngineService = inject(RulesEngineRunnerService);
  private readonly inPageNavLinkDirectives = viewChildren<InPageNavLink>(InPageNavLinkDirective);

  public newYorkAvailableRule = '';
  public helloNewYorkRule = '';
  public summerOtterRule = '';
  public lateOtterRule = '';

  public links$ = this.inPageNavPresService.links$;

  public activeRuleTab = 'configuration';

  constructor() {
    // We recommend to do the next lines in the App class
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
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives());
  }

  public activateRuleTab(tab: string) {
    this.activeRuleTab = tab;
  }
}
