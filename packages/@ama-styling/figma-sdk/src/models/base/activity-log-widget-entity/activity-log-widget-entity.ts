/**
 * Model: ActivityLogWidgetEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A Figma widget
 */
export interface ActivityLogWidgetEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the widget. */
  id: string;
  /** Name of the widget. */
  name: string;
  /** Indicates if the object is a widget available on Figma Design or FigJam. */
  editor_type: EditorTypeEnum;
}

export type TypeEnum = 'widget';
export type EditorTypeEnum = 'figma' | 'figjam';

