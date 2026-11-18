/**
 * Model: ActivityLogPluginEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A Figma plugin
 */
export interface ActivityLogPluginEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the plugin. */
  id: string;
  /** Name of the plugin. */
  name: string;
  /** Indicates if the object is a plugin is available on Figma Design or FigJam. */
  editor_type: EditorTypeEnum;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['plugin'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'plugin';
/** Array of EditorTypeEnum items */
export const LIST_EDITOR_TYPE_ENUM = ['figma', 'figjam'] as const;

/** List of available values for EditorTypeEnum */
export type EditorTypeEnum = 'figma' | 'figjam';

