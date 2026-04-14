import {
  Injectable,
} from '@angular/core';
import {
  BehaviorSubject,
  delay,
  shareReplay,
} from 'rxjs';
import {
  InPageNavLink,
} from './in-page-nav-pres';

@Injectable({
  providedIn: 'root'
})
export class InPageNavPresService {
  private readonly linksSubject = new BehaviorSubject<readonly InPageNavLink[]>([]);

  /** Observable of links */
  public links$ = this.linksSubject.pipe(
    delay(0), // Delay needed else ExpressionChangedAfterItHasBeenCheckedError throws
    shareReplay(1)
  );

  /**
   * Initialize the navigation links list
   * @param inPageNavLinkDirectives
   */
  public initialize(inPageNavLinkDirectives: readonly InPageNavLink[]) {
    this.linksSubject.next(inPageNavLinkDirectives);
  }
}
