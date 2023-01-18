import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { DynamicContentService } from './dynamic-content.service';

@Pipe({name: 'dynamicContent', pure: false})
export class DynamicContentPipe implements PipeTransform, OnDestroy {
  /** Last query value  */
  private lastQuery?: string;

  /** Subscription to retrieve media path */
  private onMediaPathChange?: Subscription;

  /** Path to the media */
  private mediaPath = '';

  constructor(private service: DynamicContentService, private cd: ChangeDetectorRef) {}

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
