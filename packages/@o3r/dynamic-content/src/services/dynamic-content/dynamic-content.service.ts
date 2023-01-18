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

  /**
   * Gets the asset path with the content root path
   *
   * @param assetPath asset location (e.g /assets-otter/imgs/my-image.png)
   */
  private getContentPath(assetPath?: string) {
    const normalizedAssetPath = this.normalizePath(assetPath);
    return this.basePath !== '' ? `${this.basePath}/${normalizedAssetPath}` : assetPath || '';
  }

  /**
   * Gets the asset path based on the content root path
   *
   * @param assetPath asset location (e.g /assets-otter/imgs/my-image.png)
   */
  private getMediaPath(assetPath?: string) {
    if (this.cmsOnlyAssetsPath && assetPath) {
      return assetPath.startsWith('/') ? assetPath : `${this.cmsOnlyAssetsPath.replace(/\/$/, '')}/${assetPath}`;
    }
    return this.getContentPath(this.mediaFolder ? `${this.mediaFolder}/${this.normalizePath(assetPath)}` : assetPath);
  }

  /**
   * Gets the asset path with the content root path
   *
   * @param assetPath asset location (e.g /assets-otter/imgs/my-image.png)
   */
  public getContentPathStream(assetPath?: string) {
    const dynPath = this.getContentPath(assetPath);
    if (!this.store) {
      return of(dynPath);
    }
    return this.store.pipe(
      select(selectAssetPathOverride),
      map((assetPathOverrides) => assetPathOverrides && assetPathOverrides[dynPath] || dynPath),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  /**
   * Gets the asset path based on the content root path
   *
   * @param assetPath asset location (e.g /assets-otter/imgs/my-image.png)
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
      shareReplay(1)
    );
  }
}
