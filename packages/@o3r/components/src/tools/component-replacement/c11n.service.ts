import { Inject, Injectable, Type } from '@angular/core';
import type { DynamicConfigurable } from '@o3r/configuration';
import type { Configuration, Context } from '@o3r/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { C11N_PRESENTERS_MAP_TOKEN } from './c11n.token';

@Injectable()
export class C11nService {
  private presentersMap: Map<string, any>;

  constructor(@Inject(C11N_PRESENTERS_MAP_TOKEN) presentersMap: Map<string, any>) {
    this.presentersMap = presentersMap;
  }

  /**
   * Add a presenter
   *
   * @param presKey The presenter key to set
   * @param presenter The new presenter
   */
  public addPresenter<T extends Context & DynamicConfigurable<Configuration>>(presKey: string, presenter: Type<T>) {
    this.presentersMap.set(presKey, presenter);
  }

  /**
   * Operator to retrieve the presenter based on a given presKey
   *
   * @param defaultPres The default presenter
   * @param presKey The presenter key to retrieve
   */
  public getPresenter<T extends Context & DynamicConfigurable<Configuration>>(defaultPres: Type<T>, presKey = 'customPresKey') {
    return (source: Observable<Configuration>): Observable<T> =>
      source.pipe(
        distinctUntilChanged((p, q) => p[presKey] === q[presKey]),
        map((config) => {
          const presenterConfig = config[presKey];
          return typeof presenterConfig === 'string' && presenterConfig !== '' ? (this.presentersMap.get(presenterConfig) || defaultPres) : defaultPres;
        })
      );
  }
}
