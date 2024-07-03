import { AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { O3rComponent } from '@o3r/core';
import { InPageNavLink, InPageNavLinkDirective, InPageNavPresService } from '../../components/utilities/in-page-nav';
import { IN_PAGE_NAV_PRES_DIRECTIVES, InPageNavPresComponent } from '../../components/utilities/in-page-nav/in-page-nav-pres.component';
import { AsyncPipe } from '@angular/common';
import { ComponentReplacementPresComponent } from '../../components/showcase/component-replacement/component-replacement-pres.component';
import { RouterModule } from '@angular/router';
import { CopyTextPresComponent } from '../../components/utilities/copy-text/copy-text-pres.component';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-component-replacement',
  templateUrl: './component-replacement.template.html',
  styleUrl: './component-replacement.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterModule, InPageNavPresComponent, AsyncPipe, IN_PAGE_NAV_PRES_DIRECTIVES, ComponentReplacementPresComponent, CopyTextPresComponent]
})
export class ComponentReplacementComponent implements AfterViewInit {

  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  constructor(private readonly inPageNavPresService: InPageNavPresService) { }

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }
}
