/* eslint-disable @typescript-eslint/naming-convention */
import {ActionCreator, createReducer, on, ReducerTypes} from '@ngrx/store';
import * as actions from './event-track.actions';
import {EventTrackState, HeroComponent} from './event-track.state';

/** The initial value of the Hero component */
export const heroComponentInitialState: HeroComponent = {id: '', TTI: 0, involvedApiEndpoints: []};

/**
 * eventTrack initial state
 */
export const eventTrackInitialState: EventTrackState = {
  heroComponent: heroComponentInitialState,
  isTTIComputed: false
};

/**
 * Return all the involved API endpoints present in the component including its child & subchild
 * Iterate recursively till the component with no children
 * @param component
 * @returns string[]
 */
function getComponentInvolvedEndPoints(component: HeroComponent): string[] {
  return Array.from(
    (component.children || []).reduce((accum, value) => {
      getComponentInvolvedEndPoints(value).forEach((item) => accum.add(item));
      return accum;
    }, new Set<string>(component.involvedApiEndpoints))
  );
}

/**
 * Get all the involved API endpoints of the heroComponent with maximum TTI value
 * If the parent contains max TTI, then all its child & subchild end points are used
 * otherwise only component with max TTI end points are used
 * @param component
 * @param maxTTI
 * @returns string[]
 */
function getInvolvedAPIEndpoints(component: HeroComponent, maxTTI: number): string[] {
  if (component.componentTTI === maxTTI) {
    return getComponentInvolvedEndPoints(component);
  }
  return Array.from(
    (component.children || []).reduce((accum, value) => {
      getInvolvedAPIEndpoints(value, maxTTI).forEach((endpoint) => accum.add(endpoint));
      return accum;
    }, new Set<string>())
  );
}

/**
 * Recursively iterate the page hierarchy
 * and set the TTI for the specified component
 * and compute the TTI for the corresponding parent
 * @param component the parent component/page
 * @param id the identifier of the component/page
 * @param value the TTI value
 * @param endpoints API URLs of the component
 * @returns HeroComponent
 */
function computeTTI(component: HeroComponent, id: string, value: number, endpoints: string[] = []): HeroComponent {
  const computedComponent = {...component};
  if (computedComponent.id === id) {
    computedComponent.TTI = value;
    computedComponent.hasBeenLogged = true;
    computedComponent.involvedApiEndpoints = endpoints;
    computedComponent.componentTTI = value;
  } else if (computedComponent.children) {
    computedComponent.children = computedComponent.children.map((child) => computeTTI(child, id, value, endpoints));
  }
  // Compute the TTI of the current component comparing the child TTI measures
  if (computedComponent.children && computedComponent.children.length > 0) {
    const maxChildTTI = Math.max(...computedComponent.children.map((child: HeroComponent) => child.TTI));
    computedComponent.TTI = Math.max(maxChildTTI, computedComponent.TTI);
  }
  return computedComponent;
}

/**
 * Check if the TTI for the page is computed
 * @param component the parent component/page
 * @returns boolean
 */
function isTTIComputed(component: HeroComponent): boolean {
  if (component.measureSelf && !component.hasBeenLogged) {
    return false;
  }
  return component.children && component.children.length > 0 ? component.children.every((child) => isTTIComputed(child)) : component.TTI > 0;
}

/**
 * List of basic actions for EventTrack
 */
export const eventTrackReducerFeatures: ReducerTypes<EventTrackState, ActionCreator[]>[] = [
  on(actions.setEventTrack, (_state, payload) => ({...payload.model})),

  on(actions.updateEventTrack, (state, payload) => ({...state, ...payload.model})),

  on(actions.resetEventTrack, () => eventTrackInitialState),

  on(actions.registerHeroComponent, (state, payload) => ({...state, heroComponent: {...payload.model, TTI: 0}})),

  on(actions.setHeroComponentTTI, (state, payload) => {
    const updatedHeroComponent = computeTTI(state.heroComponent, payload.model.id, payload.model.TTI, payload.model.involvedApiEndpoints);
    const isComputed = isTTIComputed(updatedHeroComponent);
    if (isComputed) {
      updatedHeroComponent.involvedApiEndpoints = getInvolvedAPIEndpoints(updatedHeroComponent, updatedHeroComponent.TTI) || [];
    }
    return {...state, heroComponent: updatedHeroComponent, isTTIComputed: isComputed};
  })
];

/**
 * EventTrack Store default reducer
 */
export const eventTrackReducer = createReducer(
  eventTrackInitialState,
  ...eventTrackReducerFeatures
);
