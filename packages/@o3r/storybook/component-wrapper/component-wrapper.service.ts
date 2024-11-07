import {
  Configuration,
} from '@o3r/core';
import {
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';

export class ComponentWrapperService {
  private readonly configChangeSubject$: Subject<{ componentId: string; props: Configuration }> = new ReplaySubject(1);

  /**
   * Stream which emits each time a config property has been changed in storybook UI
   */
  public configChange$: Observable<{ componentId: string; props: Configuration }>;

  constructor() {
    this.configChange$ = this.configChangeSubject$.asObservable();
  }

  /**
   * Trigger a config update for a given component
   * @param componentId Id of component to update the config for
   * @param props Configuration update object
   */
  public changeConfig<T extends Configuration = Configuration>(componentId: string, props: T) {
    this.configChangeSubject$.next({ componentId, props });
  }
}

/**
 * Instance of ComponentWrapperService to be used in stories
 */
export const wrapperService = new ComponentWrapperService();
