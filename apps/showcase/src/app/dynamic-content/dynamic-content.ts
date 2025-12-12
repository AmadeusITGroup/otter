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
  DynamicContentPres,
} from '../../components/showcase/dynamic-content';
import {
  IN_PAGE_NAV_PRES_DIRECTIVES,
  InPageNavLink,
  InPageNavLinkDirective,
  InPageNavPresService,
} from '../../components/utilities';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-dynamic-content',
  imports: [
    RouterModule,
    IN_PAGE_NAV_PRES_DIRECTIVES,
    DynamicContentPres,
    AsyncPipe,
    MarkdownModule
  ],
  templateUrl: './dynamic-content.html',
  styleUrls: ['./dynamic-content.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicContent implements AfterViewInit {
  private readonly inPageNavPresService = inject(InPageNavPresService);
  private readonly inPageNavLinkDirectives = viewChildren<InPageNavLink>(InPageNavLinkDirective);

  public links$ = this.inPageNavPresService.links$;

  public bodyDynamicContentPath = document.body.dataset.dynamiccontentpath;

  public codeDataDynamicContentPath = `<body data-dynamiccontentpath="${this.bodyDynamicContentPath || ''}">
  ...
</body>`;

  public ngAfterViewInit() {
    this.inPageNavPresService.initialize(this.inPageNavLinkDirectives());
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
