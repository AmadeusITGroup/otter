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

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['widget'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'widget';
/** Array of EditorTypeEnum items */
export const LIST_EDITOR_TYPE_ENUM = ['figma', 'figjam'] as const;

/** List of available values for EditorTypeEnum */
export type EditorTypeEnum = 'figma' | 'figjam';

