import {
  InjectionToken
} from '@angular/core';

/** The C11n injection token */
export const C11N_PRESENTERS_MAP_TOKEN: InjectionToken<string> = new InjectionToken('C11n injection token');

/** Function used to register custom components */
export const C11N_REGISTER_FUNC_TOKEN: InjectionToken<string> = new InjectionToken('C11n register presenters token');
