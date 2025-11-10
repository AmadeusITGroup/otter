import {
  Injectable,
} from '@angular/core';
import {
  BehaviorSubject,
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
  public links$ = this.linksSubject.asObservable();

  /**
   * Initialize the navigation links list
   * @param inPageNavLinkDirectives
   */
  public initialize(inPageNavLinkDirectives: readonly InPageNavLink[]) {
    this.linksSubject.next(inPageNavLinkDirectives);
  }
}
