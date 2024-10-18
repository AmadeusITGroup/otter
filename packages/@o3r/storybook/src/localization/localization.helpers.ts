import type {
  LocalizationMetadata
} from '@o3r/localization';
import {
  LOCALIZATION_PREFIX,
  LocalizationConfigs
} from './localization-configs.interface';
import {
  getLocalizationMetadata
} from './metadata-manager';

/**
 * Get storybook Localization configuration from metadata
 * @param translations Localization map
 * @param metadata Localization Metadata
 */
export function extractLocalization(translations: Record<string, string>, metadata: LocalizationMetadata = getLocalizationMetadata()): LocalizationConfigs {
  return Object.entries(translations).reduce<LocalizationConfigs>((acc, [localKey, defaultKey]) => {
    const data = metadata.find((loc) => loc.key === defaultKey);
    acc.argTypes[`${LOCALIZATION_PREFIX}${localKey}`] = {
      name: `Localization: ${localKey}`,
      description: data?.description,
      defaultValue: defaultKey,
      table: {
        defaultValue: {
          summary: defaultKey
        }
      },
      control: 'text'
    };
    return acc;
  }, { argTypes: {} });
}

/**
 * Retrieve final value from reference
 * @param metadata Localization Metadata
 * @param memory discovered references
 * @param ref metadata reference
 */
function discoverRef(metadata: LocalizationMetadata, memory: Record<string, string>, ref: string): string {
  if (memory[ref]) {
    return memory[ref];
  }

  const loc = metadata.find((data) => data.key === ref);
  if (!loc) {
    return ref;
  }

  if (loc.value) {
    memory[loc.key] = loc.value;
    return loc.value;
  } else if (loc.ref) {
    const finalValue = discoverRef(metadata, memory, loc.ref);
    memory[loc.key] = finalValue;
    return finalValue;
  }

  return loc.key;
}

/**
 * Get localization map from metatada
 * @param metadata Localization Metadata
 */
export function getLocalizations(metadata: LocalizationMetadata = getLocalizationMetadata()): Record<string, string> {
  return metadata.reduce<Record<string, string>>((acc, loc) => {
    if (acc[loc.key]) {
      return acc;
    }

    if (loc.value) {
      acc[loc.key] = loc.value;
    } else if (loc.ref) {
      acc[loc.key] = discoverRef(metadata, acc, loc.ref);
    }
    return acc;
  }, {});
}

/**
 * Apply component localization to the loaded component
 * @param localization Localization map
 * @param props Properties set to storybook control
 */
export function applyLocalization<T extends Record<string, string>>(localization: LocalizationConfigs, props: any): T {
  const regexp = new RegExp(`^${LOCALIZATION_PREFIX}`);
  return Object.keys(localization.argTypes)
    .reduce((acc, localKey) => {
      acc[localKey.replace(regexp, '') as keyof T] = props[localKey];
      return acc;
    }, {} as T);
}
