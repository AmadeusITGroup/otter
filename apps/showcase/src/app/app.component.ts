import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { SideNavLinksGroup } from '../components/index';

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
      label: 'CMS',
      links: [
        { url: '/configuration', label: 'Configuration' },
        { url: '/localization', label: 'Localization' },
        { url: '/dynamic-content', label: 'Dynamic content' },
        { url: '/rules-engine', label: 'Rules engine' }
      ]
    }
  ];

  public activeUrl$: Observable<string>;

  constructor(router: Router) {
    this.activeUrl$ = router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    );
  }
}
