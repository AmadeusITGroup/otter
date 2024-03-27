import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { O3rComponent } from '@o3r/core';
import {
  CopyTextPresComponent,
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
  TanstackPresComponent
} from '../../components';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-tanstack',
  standalone: true,
  imports: [
    CopyTextPresComponent,
    RouterLink,
    TanstackPresComponent,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    AsyncPipe
  ],
  templateUrl: './tanstack.template.html',
  styleUrls: ['./tanstack.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TanstackComponent implements AfterViewInit {
  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  constructor(private readonly inPageNavPresService: InPageNavPresService) {}

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
