import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { O3rComponent } from '@o3r/core';
import {
  CopyTextPresComponent,
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
  SdkPresComponent
} from '../../components';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-sdk',
  standalone: true,
  imports: [
    CopyTextPresComponent,
    RouterLink,
    SdkPresComponent,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe
  ],
  templateUrl: './sdk.template.html',
  styleUrls: ['./sdk.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkComponent implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);

  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
