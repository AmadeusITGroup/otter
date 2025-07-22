import {
  DestroyRef,
  inject,
  Injectable,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  Browser,
} from '@capacitor/browser';
import {
  fromEvent,
} from 'rxjs';
import {
  isCapacitorContext,
} from './helpers';

@Injectable({
  providedIn: 'root'
})
export class CapacitorTargetService {
  private readonly destroyRef = inject(DestroyRef);
  private hijackDone = false;

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
    if (!this.hijackDone) {
      fromEvent(document, 'click').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async (event) => {
        const element: EventTarget | null = event.target;
        await this.openInCapacitorBrowser(element, event);
      });
      this.hijackDone = true;
    }
  }
}
