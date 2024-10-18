import type { CssMetadata, CssVariable } from '@o3r/styling';
import { getStyleMetadata } from './metadata-manager';
import { StyleConfigs, STYLING_PREFIX } from './style-configs.interface';

/** RegExp to check if the value is a color*/
const colorRegExp = /^(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\))\s*;?$/;

/**
 * Inject CSS variable into the DOM
 * @param variableName Variable name
 * @param value Value of the CSS variable
 * @param styleElementId ID of the HTML Style element where to inject the css variable
 */
export function setCssVariable(variableName: string, value: string, styleElementId = 'storybook-css-variable-injection') {
  const styleElement = document.getElementById(styleElementId);
  if (styleElement) {
    const content = styleElement.innerHTML;
    const regExpVariable = new RegExp(`${variableName}\\s*:\\s*[^;]*;`);
    if (regExpVariable.test(content)) {
      styleElement.innerHTML = content.replace(regExpVariable, `${variableName}: ${value};`);
    } else {
      const index = content.indexOf('{') + 1;
      styleElement.innerHTML = content.slice(0, index) + `\n${variableName}: ${value};` + content.slice(index);
    }
  } else {
    const newStyleElement = document.createElement('style');
    newStyleElement.id = styleElementId;
    newStyleElement.innerHTML = `
:root {
  ${variableName}: ${value};
}`;
    document.head.append(newStyleElement);
  }
}

/**
 * Get Argument type based on CSS variable type
 * @param data CSS Variable
 * @param metadata CSS Style Metadata
 * @param mem
 */
export function getTypeAndValue(data: CssVariable, metadata: CssMetadata, mem: string[] = []): { type: 'text' | 'color'; value: string; referTo?: string } {
  if (colorRegExp.test(data.defaultValue)) {
    return {
      type: 'color',
      value: data.defaultValue
    };
  }
  if (data.references && data.references.length === 1 && /^var *\(.*\)$/.test(data.defaultValue)) {
    const referTo = data.references[0].name;
    if (metadata.variables[referTo]) {
      const isCircular = mem.includes(referTo);
      mem.push(referTo);
      if (isCircular) {
        // eslint-disable-next-line no-console
        console.error(`CSS Variable circular reference: ${mem.join('->')}. "${mem[0]}" variable will be fallback to string type input.`);
        return {
          type: 'text',
          value: data.defaultValue,
          referTo
        };
      } else {
        return {
          ...getTypeAndValue(metadata.variables[referTo], metadata, mem),
          referTo
        };
      }
    }
    if (colorRegExp.test(data.references[0].defaultValue)) {
      return {
        type: 'color',
        value: data.references[0].defaultValue
      };
    }
  }
  return {
    type: 'text',
    value: data.defaultValue
  };
}



/**
 * Extract storybook argument type base for component styling
 * @param prefix Component prefix for CSS variable
 * @param metadata CSS Style Metadata
 */
export function extractStyling(prefix = '', metadata: CssMetadata = getStyleMetadata()): StyleConfigs {
  return Object.entries(metadata.variables)
    .filter(([name]) => name.startsWith(prefix))
    .reduce<StyleConfigs>((acc, [name, data]) => {
      const { type, value, referTo } = getTypeAndValue(data, metadata);
      const controlName = `${STYLING_PREFIX}${name}`;
      acc.argTypes[controlName] = {
        name: `CSS: ${name}`,
        description: 'CSS Variable' + (referTo ? ` (refer to: ${referTo})` : ''),
        defaultValue: value,
        table: {
          defaultValue: {
            summary: data.defaultValue
          }
        },
        control: { type }
      };
      acc.rawValues[controlName] = data.defaultValue;
      return acc;
    }, { argTypes: {}, rawValues: {} });
}

/**
 * Apply component style and theme to the loaded component
 * @param style Component style
 * @param props Properties set to storybook control
 * @param theme Application theme
 */
export function applyStyle(style: StyleConfigs, props: any, theme?: Record<string, string>) {
  if (theme) {
    Object.entries(theme)
      .forEach(([name, value]) =>
        setCssVariable(`--${name}`, value, 'storybook-css-theme-injection')
      );
  }

  const regexp = new RegExp(`^${STYLING_PREFIX}`);
  Object.keys(style.argTypes)
    .forEach((variable) =>
      setCssVariable(`--${variable.replace(regexp, '')}`, style.argTypes[variable].defaultValue === props[variable] ? style.rawValues[variable] : props[variable])
    );
}

/**
 * Get theme from metadata
 * @param metadata CSS Style Metadata
 */
export function getThemeVariables(metadata: CssMetadata = getStyleMetadata()) {
  return Object.entries(metadata.variables)
    .filter(([_, data]) => data.tags && data.tags.includes('theme'))
    .reduce<Record<string, string>>((acc, [name, data]) => {
      acc[name] = data.defaultValue;
      return acc;
    }, {});
}
