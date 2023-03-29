import { EntityState } from '@ngrx/entity';
import { AsyncStoreItem } from '@o3r/core';

/**
 * Variable model from the placeholder reply
 */
export interface PlaceholderVariable {
  type: 'fact' | 'fullUrl' | 'relativeUrl' | 'localisation';
  value: string;
  vars?: string[];
  path?: string;
}

/**
 * Response of the call to the placeholder
 */
export interface PlaceholderTemplateReply {
  template?: string;
  vars?: Record<string, PlaceholderVariable>;
}

/**
 * PlaceholderTemplate model
 */
export interface PlaceholderTemplateModel extends AsyncStoreItem, PlaceholderTemplateReply {
  id: string;
  url: string;
  resolvedUrl:string;
  renderedTemplate?: string;
  unknownTypeFound?: boolean;
}

/**
 * PlaceholderTemplate state details
 */
export interface PlaceholderTemplateStateDetails extends AsyncStoreItem {
}

/**
 * PlaceholderTemplate store state
 */
export interface PlaceholderTemplateState extends EntityState<PlaceholderTemplateModel>, PlaceholderTemplateStateDetails {
}

/**
 * Name of the PlaceholderTemplate Store
 */
export const PLACEHOLDER_TEMPLATE_STORE_NAME = 'placeholderTemplate';

/**
 * PlaceholderTemplate Store Interface
 */
export interface PlaceholderTemplateStore {
  /** PlaceholderTemplate state */
  [PLACEHOLDER_TEMPLATE_STORE_NAME]: PlaceholderTemplateState;
}
