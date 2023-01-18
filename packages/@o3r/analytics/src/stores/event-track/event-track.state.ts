/**
 * The interface for Hero component, which determines the Time To Interactive (TTI) for a page
 * It follows a Tree data structure, with the root node as the Page and the hero components as
 * its children. Each child can have its own hero components. The TTI for the page
 * would be computed using a bottom-up approach starting from the children at the bottom (leaf nodes).
 */
// eslint-disable-next-line no-use-before-define
export interface HeroComponent extends RegisterHeroComponentPayload {
  /** The Time To Interactive(TTI) measure for the component */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  TTI: number;

  /**
   * Boolean to indicate if the TTI for the component
   * has been explicitly measured and logged
   */
  hasBeenLogged?: boolean;

  /**
   * List of API endpoints used in the Hero component and it's subcomponents
   * These are the API's invoked when the TTI is measured
   */
  involvedApiEndpoints?: string[];

  /**
   * Actual TTI measure of the component,
   * doesn't change upon it's children Max TTI value
   */
  componentTTI?: number;
}

/** The interface for the register hero component payload, which is used to register a hero component and its children */
export interface RegisterHeroComponentPayload {
  /** The identifier of the hero component */
  id: string;
  /**
   * Boolean to indicate if the TTI computation should take into account
   * the TTI of the component itself in addition to that of its child components
   */
  measureSelf?: boolean;
  /** The identifiers of the children hero components */
  children?: HeroComponent[];
}

/**
 * EventTrack store state
 */
export interface EventTrackState {
  /** The hero component for computing TTI */
  heroComponent: HeroComponent;

  /**
   * Boolean to indicate the completion of TTI computation
   * TTI for a hero component is considered to be computed
   * only when the TTI of all its children have been computed
   * eg: for a component A having B and C as children, this value
   * is set only when TTI for all A, B and C have been set
   */
  isTTIComputed: boolean;
}

/**
 * Name of the EventTrack Store
 */
export const EVENT_TRACK_STORE_NAME = 'eventTrack';

/**
 * EventTrack Store Interface
 */
export interface EventTrackStore {
  /** EventTrack state */
  [EVENT_TRACK_STORE_NAME]: EventTrackState;
}
