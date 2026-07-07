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
  O3rComponent,
} from '@o3r/core';
import {
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
} from '../../components';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-sdk-intro',
  imports: [
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe
  ],
  templateUrl: './sdk-intro.html',
  styleUrls: ['./sdk-intro.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkIntro implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly inPageNavLinkDirectives = viewChildren<InPageNavLink>(InPageNavLinkDirective);

  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives());
  }
}
