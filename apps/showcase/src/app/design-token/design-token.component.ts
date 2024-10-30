import {
  AsyncPipe
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {
  RouterLink
} from '@angular/router';
import {
  O3rComponent
} from '@o3r/core';
import {
  CopyTextPresComponent,
  DesignTokenPresComponent,
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService
} from '../../components';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-design-token',
  standalone: true,
  imports: [
    AsyncPipe,
    CopyTextPresComponent,
    DesignTokenPresComponent,
    RouterLink,
    IN_PAGE_NAV_PRES_DIRECTIVES
  ],
  templateUrl: './design-token.template.html',
  styleUrl: './design-token.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignTokenComponent implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);

  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;

  public links$ = this.inPageNavPresService.links$;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
