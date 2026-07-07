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
  MarkdownComponent,
} from 'ngx-markdown';
import {
  FormsParent,
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
} from '../../components/index';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-forms',
  imports: [
    RouterModule,
    FormsParent,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe,
    MarkdownComponent
  ],
  templateUrl: './forms.html',
  styleUrl: './forms.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Forms implements AfterViewInit {
  private readonly inPageNavLinkDirectives = viewChildren<InPageNavLink>(InPageNavLinkDirective);
  private readonly inPageNavPresService = inject(InPageNavPresService);

  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives());
  }
}
