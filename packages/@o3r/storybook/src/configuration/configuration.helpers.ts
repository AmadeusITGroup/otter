import {
  ComponentConfigOutput
} from '@o3r/components';
import {
  CONFIGURATION_PREFIX,
  ConfigurationConfigs
} from './configuration-configs.interface';
import {
  getConfigurationMetadata
} from './metadata-manager';

/**
 * Extract storybook argument type base for component configuration
 * @param library Name of the library
 * @param componentName Name of the storybook component
 * @param metadata Configuration Metadata
 */
export function extractConfiguration(library: string, componentName: string, metadata: ComponentConfigOutput[] = getConfigurationMetadata()): ConfigurationConfigs {
  const component = metadata.find((data) => data.name === componentName && data.library === library);
  if (!component) {
    return { argTypes: {} };
  }

  return component.properties.reduce<ConfigurationConfigs>((acc, config) => {
    const control: any = {};
    let value: any;
    switch (config.type) {
      case 'boolean': {
        control.type = config.type;
        value = config.value === 'true';
        break;
      }
      case 'number': {
        control.type = config.type;
        value = +config.value!;
        break;
      }
      case 'string': {
        control.type = 'text';
        value = config.value;
        break;
      }
      case 'enum': {
        control.type = 'select';
        control.options = config.choices;
        value = config.value;
        break;
      }
      case 'string[]': {
        control.type = 'array';
        value = config.values;
        break;
      }
      case 'element[]':
      case 'unknown': {
        control.type = 'object';
        value = config.values;
        break;
      }
      case 'unknown[]': {
        control.type = 'array';
        value = config.values;
        break;
      }
      default: {
        throw new Error(`Not supported type ${config.type} of ${config.name}`);
      }
    }
    acc.argTypes[`${CONFIGURATION_PREFIX}${config.name}`] = {
      name: `Config: ${config.label || config.name}`,
      description: config.description,
      defaultValue: value,
      table: {
        defaultValue: {
          summary: value
        }
      },
      control
    };
    return acc;
  }, { argTypes: {} });
}

const regexp = new RegExp(`^${CONFIGURATION_PREFIX}`);

/**
 * Retrieve config fields from properties received from storybook UI
 * @param props
 * @returns A map of config fields and their values
 */
export function retrieveConfigFromProps(props: any) {
  return Object.keys(props).filter((prop) => prop.match(regexp)).reduce<Record<string, any>>((acc, configKey) => {
    acc[configKey.replace(regexp, '')] = props[configKey];
    return acc;
  }, {});
}
