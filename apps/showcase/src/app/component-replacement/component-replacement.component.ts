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
  O3rComponent,
} from '@o3r/core';
import {
  MarkdownModule,
} from 'ngx-markdown';
import {
  ComponentReplacementPresComponent,
} from '../../components/showcase/component-replacement/component-replacement-pres.component';
import {
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
} from '../../components/utilities/in-page-nav';
import {
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavPresComponent,
} from '../../components/utilities/in-page-nav/in-page-nav-pres.component';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-component-replacement',
  templateUrl: './component-replacement.template.html',
  styleUrl: './component-replacement.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    InPageNavPresComponent,
    AsyncPipe,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    ComponentReplacementPresComponent,
    MarkdownModule
  ]
})
export class ComponentReplacementComponent implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);

  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;

  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
