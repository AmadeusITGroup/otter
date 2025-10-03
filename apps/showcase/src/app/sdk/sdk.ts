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
  RouterLink,
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
  SdkPres,
} from '../../components';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-sdk',
  imports: [
    RouterLink,
    SdkPres,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe,
    MarkdownModule
  ],
  templateUrl: './sdk.html',
  styleUrls: ['./sdk.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sdk implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);

  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;

  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
