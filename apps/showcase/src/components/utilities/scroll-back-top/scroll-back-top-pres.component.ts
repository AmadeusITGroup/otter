import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, DOCUMENT, ViewportScroller } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { O3rComponent } from '@o3r/core';
import { fromEvent, map } from 'rxjs';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-scroll-back-top-pres',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './scroll-back-top-pres.template.html',
  styleUrls: ['./scroll-back-top-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollBackTopPresComponent {

  private document = inject(DOCUMENT);

  private viewport = inject(ViewportScroller);

  public showScroll$ = fromEvent(this.document, 'scroll').pipe(
    takeUntilDestroyed(),
    map(() => this.viewport.getScrollPosition()?.[1] > 0)
  );

  public scrollTop() {
    window.scrollTo(0,0);
  }
}
