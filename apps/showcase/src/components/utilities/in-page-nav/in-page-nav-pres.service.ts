import { Injectable, OnDestroy, QueryList } from '@angular/core';
import { InPageNavLink } from './in-page-nav-pres.component';
import { delay, map, shareReplay, startWith, Subject, Subscription, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InPageNavPresService implements OnDestroy {
  private subscription = new Subscription();
  private linksSubject = new Subject<QueryList<InPageNavLink>>();

  /** Observable of links */
  public links$ = this.linksSubject.pipe(
    switchMap((inPageNavLinkDirectives) => inPageNavLinkDirectives.changes.pipe(
      startWith([]),
      map(() => inPageNavLinkDirectives.toArray())
    )),
    delay(0), // Delay needed else ExpressionChangedAfterItHasBeenCheckedError throws
    shareReplay(1)
  );

  /**
   * Initialize the navigation links list
   *
   * @param inPageNavLinkDirectives
   */
  public initialize(inPageNavLinkDirectives: QueryList<InPageNavLink>) {
    this.linksSubject.next(inPageNavLinkDirectives);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
