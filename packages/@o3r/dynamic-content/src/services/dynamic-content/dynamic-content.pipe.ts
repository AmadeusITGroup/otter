import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  Subscription,
} from 'rxjs';
import {
  DynamicContentService,
} from './dynamic-content.service';

@Pipe({ name: 'o3rDynamicContent', pure: false })
export class O3rDynamicContentPipe implements PipeTransform, OnDestroy {
  /** Last query value  */
  protected lastQuery?: string;

  /** Subscription to retrieve media path */
  protected onMediaPathChange?: Subscription;

  /** Path to the media */
  protected mediaPath = '';

  constructor(protected readonly service: DynamicContentService, protected readonly cd: ChangeDetectorRef) {}

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
