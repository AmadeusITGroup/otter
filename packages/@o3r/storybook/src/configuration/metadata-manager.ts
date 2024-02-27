import type { ComponentConfigOutput } from '@o3r/components';

declare global {
  interface Window {
    /** Otter Configuration metadata */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __OTTER_STORYBOOK_CONFIGURATION_METADATA__?: ComponentConfigOutput[];
  }
}

/**
 * Set Configuration Metadata
 * @param metadata Configuration Metadata
 */
export function setConfigurationMetadata(metadata: ComponentConfigOutput[]) {
  // eslint-disable-next-line no-underscore-dangle
  window.__OTTER_STORYBOOK_CONFIGURATION_METADATA__ = metadata;
}

/**
 * Get Configuration Metadata
 */
export function getConfigurationMetadata(): ComponentConfigOutput[] {
  // eslint-disable-next-line no-underscore-dangle
  const metadata = window.__OTTER_STORYBOOK_CONFIGURATION_METADATA__;
  if (!metadata) {
    throw new Error('No Configuration metadata registered');
  }
  return metadata;
}
