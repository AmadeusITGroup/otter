import type {
  FactDefinitions
} from '../engine/index';

/**
 * Interface that contains the portalFacts definition
 * This is one of the reserved fact names, it won't be part of metadata
 */
export interface PortalFacts extends FactDefinitions {
  /**
   * Map of facts coming from the portal
   */
  portalFacts: { [key: string]: string };
}
