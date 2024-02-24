import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { O3rComponent } from '@o3r/core';
import { DynamicContentModule } from '@o3r/dynamic-content';
import { CopyTextPresComponent, DynamicContentPresComponent, IN_PAGE_NAV_PRES_DIRECTIVES, InPageNavLink, InPageNavLinkDirective, InPageNavPresService } from '../../components/index';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-dynamic-content',
  standalone: true,
  imports: [
    RouterModule,
    DynamicContentModule,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    DynamicContentPresComponent,
    CopyTextPresComponent,
    AsyncPipe
  ],
  templateUrl: './dynamic-content.template.html',
  styleUrls: ['./dynamic-content.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicContentComponent implements AfterViewInit {
  @ViewChildren(InPageNavLinkDirective)
  private readonly inPageNavLinkDirectives!: QueryList<InPageNavLink>;
  public links$ = this.inPageNavPresService.links$;

  public bodyDynamicContentPath = document.body.dataset.dynamiccontentpath;

  public codeDataDynamicContentPath = `<body data-dynamiccontentpath="${this.bodyDynamicContentPath || ''}">
  ...
</body>`;

  constructor(
    private readonly inPageNavPresService: InPageNavPresService
  ) {}

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives);
  }

  public setLocalStorage() {
    localStorage.setItem('dynamicPath', 'custom-assets');
    location.reload();
  }

  public clearLocalStorage() {
    localStorage.clear();
    location.reload();
  }
}
