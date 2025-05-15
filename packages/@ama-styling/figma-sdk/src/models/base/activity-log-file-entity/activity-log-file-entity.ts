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

export type TypeEnum = 'file';
export type EditorTypeEnum = 'figma' | 'figjam';
export type LinkAccessEnum = 'view' | 'edit' | 'org_view' | 'org_edit' | 'inherit';
export type ProtoLinkAccessEnum = 'view' | 'org_view' | 'inherit';

