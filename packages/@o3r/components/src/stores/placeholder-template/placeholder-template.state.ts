import {EntityState} from '@ngrx/entity';

/**
 * PlaceholderTemplate model
 */
export interface PlaceholderTemplateModel {
  /** Placeholder id that is unique*/
  id: string;
  /** Urls to the templates to be fetched, and priority for rendering order */
  urlsWithPriority: { rawUrl:string; priority: number }[];
}

/** Possible placeholder mode */
export type PlaceholderMode = 'normal' | 'debug' | 'pending';

/**
 * PlaceholderTemplate store state
 */
export interface PlaceholderTemplateState extends EntityState<PlaceholderTemplateModel> {
  mode: PlaceholderMode;
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
