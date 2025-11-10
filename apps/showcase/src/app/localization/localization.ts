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
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
  LocalizationPres,
} from '../../components/index';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-localization',
  imports: [
    RouterModule,
    LocalizationPres,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe,
    MarkdownModule
  ],
  templateUrl: './localization.html',
  styleUrls: ['./localization.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Localization implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly inPageNavLinkDirectives = viewChildren<InPageNavLink>(InPageNavLinkDirective);

  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives());
  }
}
