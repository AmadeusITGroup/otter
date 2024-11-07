import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  Browser,
} from '@capacitor/browser';
import {
  fromEvent,
  Subscription,
} from 'rxjs';
import {
  isCapacitorContext,
} from './helpers';

@Injectable({
  providedIn: 'root'
})
export class CapacitorTargetService implements OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  private async openInCapacitorBrowser(element: EventTarget | null, event: Event) {
    if (await isCapacitorContext() && element instanceof Element) {
      if (element.tagName === 'A') {
        const url = element.getAttribute('href');
        if (element.getAttribute('target') === '_blank' && url) {
          event.preventDefault();
          await Browser.open({ url, presentationStyle: 'popover' });
        }
      } else {
        await this.openInCapacitorBrowser(element.parentElement, event);
      }
    }
  }

  /**
   * Method called for 'hijacking' the click event on <a> tags with target _blank attribute.
   * Instead of the default action, it will open the URL using the CapacitorJS Browser plugin.
   */
  public hijackClick(): void {
    if (this.subscriptions.length === 0) {
      this.subscriptions.push(fromEvent(document, 'click').subscribe(async (event) => {
        const element: EventTarget | null = event.target;
        await this.openInCapacitorBrowser(element, event);
      }));
    }
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
