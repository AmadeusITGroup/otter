import {
  ChangeDetectorRef,
  inject,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  Subscription,
} from 'rxjs';
import {
  DynamicContentService,
} from './dynamic-content-service';

@Pipe({
  name: 'o3rDynamicContent',
  pure: false
})
export class O3rDynamicContentPipe implements PipeTransform, OnDestroy {
  protected readonly service = inject(DynamicContentService);
  protected readonly cd = inject(ChangeDetectorRef);

  /** Last query value  */
  protected lastQuery?: string;

  /** Subscription to retrieve media path */
  protected onMediaPathChange?: Subscription;

  /** Path to the media */
  protected mediaPath = '';

  /** @inheritDoc */
  public transform(query?: string) {
    if (query !== this.lastQuery) {
      this.lastQuery = query;
      if (this.onMediaPathChange) {
        this.onMediaPathChange.unsubscribe();
      }
      this.onMediaPathChange = this.service.getMediaPathStream(query).subscribe((mediaPath) => {
        this.mediaPath = mediaPath;
        this.cd.markForCheck();
      });
    }

    return this.mediaPath;
  }

  /** @inheritDoc */
  public ngOnDestroy(): void {
    if (this.onMediaPathChange) {
      this.onMediaPathChange.unsubscribe();
    }
  }
}
