import { Component, OnDestroy, TemplateRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { filter, map, Observable, share, shareReplay, Subscription } from 'rxjs';
import { SideNavLinksGroup } from '../components/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
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
      label: 'CMS',
      links: [
        { url: '/configuration', label: 'Configuration' },
        { url: '/localization', label: 'Localization' },
        { url: '/dynamic-content', label: 'Dynamic content' },
        { url: '/rules-engine', label: 'Rules engine' }
      ]
    },
    {
      label: '',
      links: [
        { url: '/sdk', label: 'SDK Generator' }
      ]
    }
  ];

  public activeUrl$: Observable<string>;

  private offcanvasRef: NgbOffcanvasRef | undefined;

  private subscriptions = new Subscription();

  constructor(router: Router, private offcanvasService: NgbOffcanvas) {
    const onNavigationEnd$ = router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      share()
    );
    this.activeUrl$ = onNavigationEnd$.pipe(
      map((event) => event.urlAfterRedirects),
      shareReplay({bufferSize: 1, refCount: true})
    );
    this.subscriptions.add(onNavigationEnd$.subscribe((event) => {
      if (this.offcanvasRef) {
        this.offcanvasRef.dismiss();
      }
      if (!/dynamic-content/.test(event.urlAfterRedirects) && localStorage.getItem('dynamicPath')) {
        localStorage.removeItem('dynamicPath');
        location.reload();
      }
    }));
  }

  public open(content: TemplateRef<any>) {
    this.offcanvasRef = this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title' });
    this.subscriptions.add(this.offcanvasRef.dismissed.subscribe(() => {
      this.offcanvasRef = undefined;
    }));
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
