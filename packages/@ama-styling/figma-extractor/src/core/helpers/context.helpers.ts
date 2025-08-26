import type {
  FigmaFileContext,
  FigmaProjectContext,
} from '../interfaces';

/**
 * Determine if the object contain the Figma Context
 * @param context Context object to test
 */
export const isFigmaFileContext = <T>(context: T): context is (T & FigmaFileContext) => {
  return typeof context === 'object' && typeof (context as any)?.fileKey === 'string';
};

/**
 * Determine if the object contain the Project Context
 * @param context Context object to test
 */
export const isFigmaProjectContext = <T>(context: T): context is (T & FigmaProjectContext) => {
  return typeof context === 'object' && typeof (context as any)?.projectKey === 'string';
};
