import type {
  CssMetadata
} from '@o3r/styling';

declare global {
  interface Window {
    /** Otter Style metadata */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- custom variable exposed on window
    __OTTER_STORYBOOK_STYLE_METADATA__?: CssMetadata;
  }
}

/**
 * Set Style Metadata
 * @param metadata CSS Style Metadata
 */
export function setStyleMetadata(metadata: CssMetadata) {
  window.__OTTER_STORYBOOK_STYLE_METADATA__ = metadata;
}

/**
 * Get Style Metadata
 */
export function getStyleMetadata(): CssMetadata {
  const metadata = window.__OTTER_STORYBOOK_STYLE_METADATA__;
  if (!metadata) {
    throw new Error('No Styling metadata registered');
  }
  return metadata;
}
