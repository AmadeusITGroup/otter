import { EntityState } from '@ngrx/entity';
import { AsyncStoreItem } from '@o3r/core';

/**
 * Variable model from the placeholder reply
 */
export interface PlaceholderVariable {
  type: 'fact' | 'fullUrl' | 'relativeUrl' | 'localisation';
  value: string;
  vars?: string[];
  parameters?: Record<string, string>;
  path?: string;
}

/**
 * Raw JSON template coming back from the CMS or any other source
 */
export interface PlaceholderRequestReply {
  template?: string;
  vars?: Record<string, PlaceholderVariable>;
}

/**
 * PlaceholderRequest model
 */
export interface PlaceholderRequestModel extends AsyncStoreItem, PlaceholderRequestReply {
  /** Raw URL that is not localized, ex: my_url/[LANGUAGE]/my_placeholder.json */
  id: string;
  /** Resolved URL that is localized, ex: my_url/en-GB/my_placeholder.json  */
  resolvedUrl: string;
  /** Rendered template associated to the resolved URL, can be dynamic */
  renderedTemplate?: string;
  /** Unknown type found in the reply */
  unknownTypeFound?: boolean;

  /** A mechanism to cache previous request results for a given language. This boolean disables the dynamic rendering when it is set to false */
  used?: boolean;
}

/**
 * PlaceholderRequest state details
 */
export interface PlaceholderRequestStateDetails extends AsyncStoreItem {}

/**
 * PlaceholderRequest store state
 */
export interface PlaceholderRequestState extends EntityState<PlaceholderRequestModel>, PlaceholderRequestStateDetails {
}

/**
 * Name of the PlaceholderRequest Store
 */
export const PLACEHOLDER_REQUEST_STORE_NAME = 'placeholderRequest';

/**
 * PlaceholderRequest Store Interface
 */
export interface PlaceholderRequestStore {
  /** PlaceholderRequest state */
  [PLACEHOLDER_REQUEST_STORE_NAME]: PlaceholderRequestState;
}
