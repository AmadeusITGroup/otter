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
  RouterModule,
} from '@angular/router';
import {
  O3rComponent,
} from '@o3r/core';
import {
  MarkdownModule,
} from 'ngx-markdown';
import {
  ComponentReplacementPres,
} from '../../components/showcase/component-replacement/component-replacement-pres';
import {
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
} from '../../components/utilities/in-page-nav';
import {
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavPres,
} from '../../components/utilities/in-page-nav/in-page-nav-pres';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-component-replacement',
  templateUrl: './component-replacement.html',
  styleUrl: './component-replacement.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    InPageNavPres,
    AsyncPipe,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    ComponentReplacementPres,
    MarkdownModule
  ]
})
export class ComponentReplacement implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly inPageNavLinkDirectives = viewChildren<InPageNavLink>(InPageNavLinkDirective);

  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives());
  }
}
