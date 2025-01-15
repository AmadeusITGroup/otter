import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
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
  scrollTo: (e: MouseEvent) => void;
}

@Directive({
  selector: 'h2[id]',
  standalone: true
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
   * @param e mouse event
   */
  public scrollTo(e: MouseEvent) {
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
  templateUrl: './in-page-nav-pres.template.html',
  styleUrls: ['./in-page-nav-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InPageNavPresComponent implements OnChanges, OnDestroy {
  /** Id of the scroll spy */
  @Input()
  public id = 'in-page-nav';

  /** List of links */
  @Input()
  public links: InPageNavLink[] = [];

  private readonly scrollSpyService = inject(NgbScrollSpyService);

  public ngOnChanges(simpleChanges: SimpleChanges) {
    if ((simpleChanges.links.isFirstChange() || simpleChanges.links.currentValue !== simpleChanges.links.previousValue) && this.links) {
      this.scrollSpyService.start({
        fragments: this.links.map((link) => link.id)
      });
    }
  }

  public ngOnDestroy() {
    this.scrollSpyService.stop();
  }
}

export const IN_PAGE_NAV_PRES_DIRECTIVES = [
  InPageNavPresComponent,
  InPageNavLinkDirective
] as const;
