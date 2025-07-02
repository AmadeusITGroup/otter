import {
  Injectable,
  QueryList,
} from '@angular/core';
import {
  delay,
  map,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import {
  InPageNavLink,
} from './in-page-nav-pres.component';

@Injectable({
  providedIn: 'root'
})
export class InPageNavPresService {
  private readonly linksSubject = new Subject<QueryList<InPageNavLink>>();

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
   * @param inPageNavLinkDirectives
   */
  public initialize(inPageNavLinkDirectives: QueryList<InPageNavLink>) {
    this.linksSubject.next(inPageNavLinkDirectives);
  }
}
