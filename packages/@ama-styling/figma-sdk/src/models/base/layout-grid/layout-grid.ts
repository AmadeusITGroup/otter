/**
 * Model: LayoutGrid
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { LayoutGridBoundVariables } from '../layout-grid-bound-variables';
import { RGBA } from '../r-g-b-a';

/**
 * Guides to align and place objects within a frames.
 */
export interface LayoutGrid {
  /** Orientation of the grid as a string enum  - `COLUMNS`: Vertical grid - `ROWS`: Horizontal grid - `GRID`: Square grid */
  pattern: PatternEnum;
  /** Width of column grid or height of row grid or square grid spacing. */
  sectionSize: number;
  /** Is the grid currently visible? */
  visible: boolean;
  /** @see RGBA */
  color: RGBA;
  /** Positioning of grid as a string enum  - `MIN`: Grid starts at the left or top of the frame - `MAX`: Grid starts at the right or bottom of the frame - `STRETCH`: Grid is stretched to fit the frame - `CENTER`: Grid is center aligned */
  alignment: AlignmentEnum;
  /** Spacing in between columns and rows */
  gutterSize: number;
  /** Spacing before the first column or row */
  offset: number;
  /** Number of columns or rows */
  count: number;
  /** @see LayoutGridBoundVariables */
  boundVariables?: LayoutGridBoundVariables;
}

export type PatternEnum = 'COLUMNS' | 'ROWS' | 'GRID';
export type AlignmentEnum = 'MIN' | 'MAX' | 'STRETCH' | 'CENTER';

