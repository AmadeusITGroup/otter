import {
  createAction,
  props
} from '@ngrx/store';
import {
  EventTrackState,
  RegisterHeroComponentPayload
} from './event-track.state';

/** StateActions */
const ACTION_SET = '[EventTrack] set';
const ACTION_UPDATE = '[EventTrack] update';
const ACTION_REGISTER_HERO_COMPONENT = '[EventTrack] register hero component';
const ACTION_SET_HERO_COMPONENT_TTI = '[EventTrack] set hero component TTI';
const ACTION_RESET = '[EventTrack] reset';

/**
 * The payload for setting TTI for a hero component
 */
export interface SetHeroComponentTTIPayload {
  /**
   * The identifier of the hero component
   */
  id: string;

  /**
   * The TTI measure for the hero component
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed by Lighthouse
  TTI: number;

  /**
   * List of API endpoints used in the Hero component and it's subcomponents
   * These are the API's invoked when the TTI is measured
   */
  involvedApiEndpoints?: string[];
}

/**
 * Clear the current store object and replace it with the new one
 */
export const setEventTrack = createAction(ACTION_SET, props<{ model: EventTrackState }>());

/**
 * Change a part or the whole object in the store.
 */
export const updateEventTrack = createAction(ACTION_UPDATE, props<Partial<{ model: EventTrackState }>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetEventTrack = createAction(ACTION_RESET);

/**
 * Register hero component in the store
 */
export const registerHeroComponent = createAction(ACTION_REGISTER_HERO_COMPONENT, props<{ model: RegisterHeroComponentPayload }>());

/**
 * Set the TTI measure for a hero component in the store
 */
export const setHeroComponentTTI = createAction(ACTION_SET_HERO_COMPONENT_TTI, props<{ model: SetHeroComponentTTIPayload }>());
