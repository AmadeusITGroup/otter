import type {
  ComponentConfigOutput,
} from '@o3r/components';

declare global {
  interface Window {
    /** Otter Configuration metadata */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- custom variable exposed on window
    __OTTER_STORYBOOK_CONFIGURATION_METADATA__?: ComponentConfigOutput[];
  }
}

/**
 * Set Configuration Metadata
 * @param metadata Configuration Metadata
 */
export function setConfigurationMetadata(metadata: ComponentConfigOutput[]) {
  window.__OTTER_STORYBOOK_CONFIGURATION_METADATA__ = metadata;
}

/**
 * Get Configuration Metadata
 */
export function getConfigurationMetadata(): ComponentConfigOutput[] {
  const metadata = window.__OTTER_STORYBOOK_CONFIGURATION_METADATA__;
  if (!metadata) {
    throw new Error('No Configuration metadata registered');
  }
  return metadata;
}
