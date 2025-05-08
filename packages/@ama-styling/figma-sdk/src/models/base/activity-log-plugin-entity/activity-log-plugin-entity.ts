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

export type TypeEnum = 'plugin';
export type EditorTypeEnum = 'figma' | 'figjam';

