import { Inject, Injectable, Optional } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { AssetPathOverrideStore, selectAssetPathOverride } from '../../stores/index';
import { CMS_ASSETS_PATH_TOKEN, DYNAMIC_CONTENT_BASE_PATH_TOKEN } from './dynamic-content.token';

const MEDIA_FOLDER_NAME = 'assets';

/**
 * Service for getting dynamic content path
 */
@Injectable()
export class DynamicContentService {
  public readonly basePath: string;

  private readonly mediaFolder: string;

  constructor(@Inject(DYNAMIC_CONTENT_BASE_PATH_TOKEN) dynamicContentPath: string,
              @Inject(CMS_ASSETS_PATH_TOKEN) private cmsOnlyAssetsPath: string,
              @Optional() private store?: Store<AssetPathOverrideStore>) {
    this.basePath = dynamicContentPath.replace(/\/$/, '');
    this.mediaFolder = MEDIA_FOLDER_NAME;
  }

  private normalizePath(assetPath?: string) {
    return !assetPath ? '' : assetPath.replace(/^\//, '');
  }

  private getContentPath(assetPath?: string) {
    const normalizedAssetPath = this.normalizePath(assetPath);
    return this.basePath !== '' ? `${this.basePath}/${normalizedAssetPath}` : assetPath || '';
  }

  private getMediaPath(assetPath?: string) {
    if (this.cmsOnlyAssetsPath && assetPath) {
      return assetPath.startsWith('/') ? assetPath : `${this.cmsOnlyAssetsPath.replace(/\/$/, '')}/${assetPath}`;
    }
    return this.getContentPath(this.mediaFolder ? `${this.mediaFolder}/${this.normalizePath(assetPath)}` : assetPath);
  }

  /**
   * Gets the full path of a content relative to the root
   * Content path doesn't consider any override, you will always get the same file
   *
   * @example getMediaPath('assets/imgs/my-image.png') will give you the basePath + 'assets/imgs/my-image.png'
   *
   * @param assetPath asset location in the root folder
   */
  public getContentPathStream(assetPath?: string) {
    return of(this.getContentPath(assetPath));
  }

  /**
   * Gets the stream that provides the full path of a media content
   * A Media content is always stored in the 'assets' media folder, no external content will be accessible through this function
   * If any override is applied to the content, returns the override path instead
   *
   * @example getMediaPathStream('imgs/my-image.png') will give you the basePath + mediaFolder + 'imgs/my-image.png'
   *
   * @param assetPath asset location in the media folder (e.g imgs/my-image.png)
   */
  public getMediaPathStream(assetPath?: string) {
    if (!this.store) {
      return of(this.getMediaPath(assetPath));
    }
    return this.store.pipe(
      select(selectAssetPathOverride),
      map((entities) => assetPath && entities && entities[assetPath] ? entities[assetPath] : assetPath),
      map((finalAssetPath) => this.getMediaPath(finalAssetPath)),
      distinctUntilChanged(),
      shareReplay({bufferSize: 1, refCount: true})
    );
  }
}
