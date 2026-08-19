import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  effect,
  inject,
  input,
  OnDestroy,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  NgbScrollSpyModule,
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  O3rComponent,
} from '@o3r/core';

export interface InPageNavLink {
  id: string;
  label: string;
  scrollTo: (e: Event) => void;
}

@Directive({
  selector: 'h2[id]'
})
export class InPageNavLinkDirective implements InPageNavLink, AfterViewInit {
  /** HTML id of the h2 */
  public id = '';

  /** InnerText of the h2 */
  public label = '';

  private readonly nativeElement: HTMLElement = inject(ViewContainerRef).element.nativeElement;

  public ngAfterViewInit() {
    this.id = this.nativeElement.id;
    this.label = this.nativeElement.innerText;
  }

  /**
   * Scroll to the h2 HTML element
   * @param e event
   */
  public scrollTo(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start'
    });
  }
}

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-in-page-nav-pres',
  imports: [NgbScrollSpyModule],
  templateUrl: './in-page-nav-pres.html',
  styleUrls: ['./in-page-nav-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InPageNavPres implements OnDestroy {
  /** Id of the scroll spy */
  public readonly id = input('in-page-nav');

  /** List of links */
  public readonly links = input<readonly InPageNavLink[] | null>([]);

  private readonly scrollSpyService = inject(NgbScrollSpyService);

  constructor() {
    effect(() => {
      const links = this.links();
      if (links?.length) {
        this.scrollSpyService.start({
          fragments: links.map((link) => link.id)
        });
      }
    });
  }

  public ngOnDestroy() {
    this.scrollSpyService.stop();
  }
}

export const IN_PAGE_NAV_PRES_DIRECTIVES = [
  InPageNavPres,
  InPageNavLinkDirective
] as const;
