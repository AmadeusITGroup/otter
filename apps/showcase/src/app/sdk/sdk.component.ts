import {AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from '@angular/router';
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
    CommonModule,
    CopyTextPresComponent,
    RouterLink,
    SdkPresComponent,
    IN_PAGE_NAV_PRES_DIRECTIVES
  ],
  templateUrl: './sdk.template.html',
  styleUrls: ['./sdk.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkComponent implements AfterViewInit {
  @ViewChildren(InPageNavLinkDirective)
  private inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  constructor(private inPageNavPresService: InPageNavPresService) {}

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
