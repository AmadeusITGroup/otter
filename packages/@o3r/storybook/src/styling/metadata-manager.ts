import type {
  CssMetadata
} from '@o3r/styling';

declare global {
  interface Window {
    /** Otter Style metadata */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __OTTER_STORYBOOK_STYLE_METADATA__?: CssMetadata;
  }
}

/**
 * Set Style Metadata
 * @param metadata CSS Style Metadata
 */
export function setStyleMetadata(metadata: CssMetadata) {
  // eslint-disable-next-line no-underscore-dangle
  window.__OTTER_STORYBOOK_STYLE_METADATA__ = metadata;
}

/**
 * Get Style Metadata
 */
export function getStyleMetadata(): CssMetadata {
  // eslint-disable-next-line no-underscore-dangle
  const metadata = window.__OTTER_STORYBOOK_STYLE_METADATA__;
  if (!metadata) {
    throw new Error('No Styling metadata registered');
  }
  return metadata;
}
