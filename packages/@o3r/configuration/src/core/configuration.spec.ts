import type {
  Configuration
} from '@o3r/core';
import {
  BehaviorSubject,
  firstValueFrom,
  Subject
} from 'rxjs';
import {
  take
} from 'rxjs/operators';
import {
  getConfiguration
} from './configuration';

describe('Configuration operators getConfiguration', () => {
  const config$: Subject<Configuration> = new BehaviorSubject<Configuration>({});

  it('should get the given component config', async () => {
    config$.next({});
    const computedConfig: Promise<Partial<Configuration>> = firstValueFrom(config$.pipe(
      getConfiguration({ id: 'SearchTypePresenter@otter/demo-components', showComplexBtn: true })
    ));
    await expect(computedConfig).resolves.toEqual({ id: 'SearchTypePresenter@otter/demo-components', showComplexBtn: true });
  });

  it('should get the given component config and apply store override', async () => {
    config$.next({ id: 'test@otter/demo-components', flexibilityDaysSearch: 19 });
    const computedConfig: Promise<Partial<Configuration>> = firstValueFrom(config$.pipe(
      getConfiguration({ id: 'SearchTypePresenter@otter/demo-components', showComplexBtn: true }),
      take(1)
    ));
    await expect(computedConfig).resolves.toEqual({ id: 'test@otter/demo-components', flexibilityDaysSearch: 19, showComplexBtn: true });
  });
});
