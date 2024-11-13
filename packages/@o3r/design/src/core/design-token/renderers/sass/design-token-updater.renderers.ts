import { type CssStyleContentUpdaterOptions, getCssStyleContentUpdater } from '../css';
import type { DesignContentFileUpdater } from '../design-token.renderer.interface';

/** Options for {@link getSassStyleContentUpdater} */
export interface SassStyleContentUpdaterOptions extends Exclude<CssStyleContentUpdaterOptions, 'scopeOnNewFile'> {
}

/**
 * Retrieve a content updater function for SASS generator
 * @param options
 */
export const getSassStyleContentUpdater = (options?: SassStyleContentUpdaterOptions): DesignContentFileUpdater => {
  return getCssStyleContentUpdater({ ...options, scopeOnNewFile: false });
};
