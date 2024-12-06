import {
  Component,
  DestroyRef,
  inject,
  TemplateRef,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  NgbOffcanvas,
  NgbOffcanvasRef,
} from '@ng-bootstrap/ng-bootstrap';
import {
  O3rComponent,
} from '@o3r/core';
import {
  filter,
  map,
  Observable,
  share,
  shareReplay,
} from 'rxjs';
import {
  SideNavLinksGroup,
} from '../components/utilities/sidenav';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'showcase';

  public linksGroups: SideNavLinksGroup[] = [
    {
      label: '',
      links: [
        { url: '/home', label: 'Home' },
        { url: '/run-app-locally', label: 'Run app locally' }
      ]
    },
    {
      label: 'Personalization',
      links: [
        { url: '/configuration', label: 'Configuration' },
        { url: '/localization', label: 'Localization' },
        { url: '/design-token', label: 'Design Tokens' },
        { url: '/dynamic-content', label: 'Dynamic content' },
        { url: '/component-replacement', label: 'Component replacement' },
        { url: '/rules-engine', label: 'Rules engine' },
        { url: '/placeholder', label: 'Placeholder' }
      ]
    },
    {
      label: 'SDK',
      links: [
        { url: '/sdk-intro', label: 'Introduction' },
        { url: '/sdk', label: 'Generator' }
      ]
    },
    {
      label: 'Training',
      links: [
        { url: '/sdk-training', label: 'SDK Training' }
      ]
    }
  ];

  public activeUrl$: Observable<string>;

  private offcanvasRef: NgbOffcanvasRef | undefined;

  private readonly router = inject(Router);
  private readonly offcanvasService = inject(NgbOffcanvas);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const onNavigationEnd$ = this.router.events.pipe(
      takeUntilDestroyed(),
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      share()
    );
    this.activeUrl$ = onNavigationEnd$.pipe(
      map((event) => event.urlAfterRedirects),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    onNavigationEnd$.subscribe((event) => {
      if (this.offcanvasRef) {
        this.offcanvasRef.dismiss();
      }
      if (!/dynamic-content/.test(event.urlAfterRedirects) && localStorage.getItem('dynamicPath')) {
        localStorage.removeItem('dynamicPath');
        location.reload();
      }
    });
  }

  public open(content: TemplateRef<any>) {
    this.offcanvasRef = this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title' });
    this.offcanvasRef.dismissed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.offcanvasRef = undefined;
    });
  }
}
