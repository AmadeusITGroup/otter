import {
  AsyncPipe,
  ViewportScroller,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  O3rComponent,
} from '@o3r/core';
import {
  fromEvent,
  map,
} from 'rxjs';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-scroll-back-top-pres',
  imports: [AsyncPipe],
  templateUrl: './scroll-back-top-pres.html',
  styleUrls: ['./scroll-back-top-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollBackTopPres {
  private readonly document = inject(DOCUMENT);

  private readonly viewport = inject(ViewportScroller);

  public showScroll$ = fromEvent(this.document, 'scroll').pipe(
    takeUntilDestroyed(),
    map(() => this.viewport.getScrollPosition()?.[1] > 0)
  );

  public scrollTop() {
    window.scrollTo(0, 0);
  }
}
