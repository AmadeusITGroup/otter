/**
 * Model: ActivityLogFileEntity
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * A Figma Design or FigJam file
 */
export interface ActivityLogFileEntity {
  /** The type of entity. */
  type: TypeEnum;
  /** Unique identifier of the file. */
  key: string;
  /** Name of the file. */
  name: string;
  /** Indicates if the object is a file on Figma Design or FigJam. */
  editor_type: EditorTypeEnum;
  /** Access policy for users who have the link to the file. */
  link_access: LinkAccessEnum;
  /** Access policy for users who have the link to the file's prototype. */
  proto_link_access: ProtoLinkAccessEnum;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['file'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'file';
/** Array of EditorTypeEnum items */
export const LIST_EDITOR_TYPE_ENUM = ['figma', 'figjam'] as const;

/** List of available values for EditorTypeEnum */
export type EditorTypeEnum = 'figma' | 'figjam';
/** Array of LinkAccessEnum items */
export const LIST_LINK_ACCESS_ENUM = ['view', 'edit', 'org_view', 'org_edit', 'inherit'] as const;

/** List of available values for LinkAccessEnum */
export type LinkAccessEnum = 'view' | 'edit' | 'org_view' | 'org_edit' | 'inherit';
/** Array of ProtoLinkAccessEnum items */
export const LIST_PROTO_LINK_ACCESS_ENUM = ['view', 'org_view', 'inherit'] as const;

/** List of available values for ProtoLinkAccessEnum */
export type ProtoLinkAccessEnum = 'view' | 'org_view' | 'inherit';

