import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbNav, NgbNavItem, NgbNavLink } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ApplicationDevtoolsModule } from '@o3r/application';
import { ComponentsDevtoolsModule } from '@o3r/components';
import { ConfigOverrideStoreModule, ConfigurationBaseServiceModule, ConfigurationDevtoolsMessageService, ConfigurationDevtoolsModule } from '@o3r/configuration';
import { O3rComponent } from '@o3r/core';
import { AssetPathOverrideStoreModule, DynamicContentService } from '@o3r/dynamic-content';
import { LocalizationOverrideStoreModule } from '@o3r/localization';
import {
  dateInNextMinutes,
  Operator,
  Rule,
  RulesEngineDevtoolsMessageService,
  RulesEngineDevtoolsModule,
  RulesEngineModule,
  RulesEngineService,
  RulesetsStore,
  setRulesetsEntities,
  UnaryOperator
} from '@o3r/rules-engine';
import { firstValueFrom } from 'rxjs';
import { CopyTextPresComponent, IN_PAGE_NAV_PRES_DIRECTIVES, InPageNavLink, InPageNavLinkDirective, InPageNavPresService, RulesEnginePresComponent } from '../../components/index';
import { environment } from '../../environments/environment.development';
import { TripFactsService } from '../../facts/index';
import { duringSummer } from '../../operators/index';
import { CurrentTimeFactsService } from '../../services/current-time-facts.service';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-rules-engine',
  standalone: true,
  imports: [
    CommonModule,
    RulesEnginePresComponent,
    ConfigurationBaseServiceModule,
    ConfigurationDevtoolsModule,
    ApplicationDevtoolsModule,
    ComponentsDevtoolsModule,
    RulesEngineModule,
    RulesEngineDevtoolsModule,
    ConfigOverrideStoreModule,
    AssetPathOverrideStoreModule,
    LocalizationOverrideStoreModule,
    CopyTextPresComponent,
    RouterModule,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    NgbNav,
    NgbNavItem,
    NgbNavLink
  ],
  templateUrl: './rules-engine.template.html',
  styleUrls: ['./rules-engine.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesEngineComponent implements OnInit, AfterViewInit {
  public newYorkAvailableRule = '';
  public helloNewYorkRule = '';
  public summerOtterRule = '';
  public lateOtterRule = '';

  @ViewChildren(InPageNavLinkDirective)
  private inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  public activeRuleTab = 'configuration';

  constructor(
    private inPageNavPresService: InPageNavPresService,
    private dynamicContentService: DynamicContentService,
    private tripFactsService: TripFactsService,
    public currentTimeFactsService: CurrentTimeFactsService,
    private store: Store<RulesetsStore>,
    configurationDevtoolsMessageService: ConfigurationDevtoolsMessageService,
    rulesEngineDevtoolsMessageService: RulesEngineDevtoolsMessageService,
    rulesEngineService: RulesEngineService
  ) {
    configurationDevtoolsMessageService.activate();
    rulesEngineDevtoolsMessageService.activate();
    rulesEngineService.engine.upsertOperators([duringSummer] as UnaryOperator[]);
    rulesEngineService.engine.upsertOperators([dateInNextMinutes] as Operator[]);
  }

  private formatRule(rule: Rule) {
    return {
      ...rule,
      id: '[generated-uuid]'
    };
  }

  public async ngOnInit() {
    const path = await firstValueFrom(
      this.dynamicContentService.getContentPathStream(
        `${!environment.production ? 'assets/' : ''}rules/rulesets.json`
      )
    );

    const resultCall = await fetch(path);
    const result = await resultCall.json();

    this.store.dispatch(setRulesetsEntities({ entities: result.rulesets }));
    this.tripFactsService.register();
    // uncomment to test currentTimeFactsService override
    // this.currentTimeFactsService.register();
    const [
      newYorkAvailableRule,
      helloNewYorkRule,
      summerOtterRule,
      lateOtterRule
    ] = result.rulesets[0].rules as Rule[];
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
