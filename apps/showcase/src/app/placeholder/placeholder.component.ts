import {
  AsyncPipe
} from '@angular/common';
import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  type QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {
  RouterModule
} from '@angular/router';
import {
  Store
} from '@ngrx/store';
import {
  PlaceholderRulesEngineActionHandler,
  PlaceholderRulesEngineActionModule
} from '@o3r/components/rules-engine';
import {
  O3rComponent
} from '@o3r/core';
import {
  DynamicContentModule,
  DynamicContentService
} from '@o3r/dynamic-content';
import {
  RulesEngineDevtoolsModule,
  RulesEngineRunnerModule,
  RulesEngineRunnerService,
  RulesetsStore,
  setRulesetsEntities
} from '@o3r/rules-engine';
import {
  firstValueFrom
} from 'rxjs';
import {
  IN_PAGE_NAV_PRES_DIRECTIVES,
  type InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
  PlaceholderPresComponent
} from '../../components';
import {
  environment
} from '../../environments/environment.development';
import {
  TripFactsService
} from '../../facts';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-placeholder-page',
  standalone: true,
  imports: [
    PlaceholderPresComponent,
    DynamicContentModule,
    RulesEngineRunnerModule,
    RulesEngineDevtoolsModule,
    PlaceholderRulesEngineActionModule,
    RouterModule,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe
  ],
  templateUrl: './placeholder.template.html',
  styleUrl: './placeholder.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly dynamicContentService = inject(DynamicContentService);
  private readonly store = inject(Store<RulesetsStore>);

  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;

  public links$ = this.inPageNavPresService.links$;

  constructor() {
    // We recommend to do the next lines in the AppComponent
    // Here we do it for the sake of the example
    inject(TripFactsService).register();
    inject(RulesEngineRunnerService).actionHandlers.add(inject(PlaceholderRulesEngineActionHandler));
    void this.loadRuleSet();
  }

  private async loadRuleSet() {
    const path = await firstValueFrom(
      this.dynamicContentService.getContentPathStream(
        `${environment.production ? '' : 'assets/'}rules/rulesets.json`
      )
    );

    const resultCall = await fetch(path);
    const result = await resultCall.json();

    this.store.dispatch(setRulesetsEntities({ entities: result.rulesets }));
  }

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
