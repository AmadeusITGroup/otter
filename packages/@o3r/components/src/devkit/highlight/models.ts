/**
 * Model to describe a group of elements
 */
export interface GroupInfo {
  /**
   * Text color for the {@link displayName}
   */
  color?: string;
  /**
   * Color of the border of the element once highlighted
   */
  backgroundColor: string;
  /**
   * Name of the group display
   */
  displayName: string;
  /**
   * Regexp to detect the elements part of the group
   */
  regexp: string;
}

/**
 * Element associated to his group information
 */
export interface ElementWithGroupInfo extends GroupInfo {
  /** HTML element */
  htmlElement: HTMLElement;
}

/**
 * Element associated to his group information and depth
 */
export interface ElementWithGroupInfoAndDepth extends ElementWithGroupInfo {
  /**
   * Number of ancestors
   */
  depth: number;
}
