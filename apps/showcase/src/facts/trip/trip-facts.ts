import {
  FactDefinitions,
} from '@o3r/rules-engine';

/** Facts for a trip */
export interface TripFacts extends FactDefinitions {
  /** Trip destination */
  destination: string | null;
  /** Trip outbound date */
  outboundDate: string | null;
}
