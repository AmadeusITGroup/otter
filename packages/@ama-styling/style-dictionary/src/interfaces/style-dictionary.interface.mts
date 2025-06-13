/**
 * Style Dictionary Transform Group interface
 * TODO: rely on the Style Dictionary type when available
 */
export interface TransformGroup {
  /** Name of the transform group */
  name: string;
  /** List of transform part of it */
  transforms: string[];
}
