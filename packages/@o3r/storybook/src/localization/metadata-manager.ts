import type { LocalizationMetadata } from '@o3r/localization';

declare global {
  interface Window {
    /** Otter Localization metadata */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __OTTER_STORYBOOK_LOCALIZATION_METADATA__?: LocalizationMetadata;
  }
}

/**
 * Set Localization Metadata
 *
 * @param metadata Localization Metadata
 */
export function setLocalizationMetadata(metadata: LocalizationMetadata) {
  // eslint-disable-next-line no-underscore-dangle
  window.__OTTER_STORYBOOK_LOCALIZATION_METADATA__ = metadata;
}

/**
 * Get Localization Metadata
 */
export function getLocalizationMetadata(): LocalizationMetadata {
  // eslint-disable-next-line no-underscore-dangle
  const metadata = window.__OTTER_STORYBOOK_LOCALIZATION_METADATA__;
  if (!metadata) {
    throw new Error('No Localization metadata registered');
  }
  return metadata;
}
