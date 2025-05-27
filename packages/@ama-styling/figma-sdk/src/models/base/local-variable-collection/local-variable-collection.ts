/**
 * Model: LocalVariableCollection
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { LocalVariableCollectionModesInner } from '../local-variable-collection-modes-inner';

/**
 * A grouping of related Variable objects each with the same modes.
 */
export interface LocalVariableCollection {
  /** The unique identifier of this variable collection. */
  id: string;
  /** The name of this variable collection. */
  name: string;
  /** The key of this variable collection. */
  key: string;
  /** The modes of this variable collection. */
  modes: LocalVariableCollectionModesInner[];
  /** The id of the default mode. */
  defaultModeId: string;
  /** Whether this variable collection is remote. */
  remote: boolean;
  /** Whether this variable collection is hidden when publishing the current file as a library. */
  hiddenFromPublishing: boolean;
  /** The ids of the variables in the collection. Note that the order of these variables is roughly the same as what is shown in Figma Design, however it does not account for groups. As a result, the order of these variables may not exactly reflect the exact ordering and grouping shown in the authoring UI. */
  variableIds: string[];
}


