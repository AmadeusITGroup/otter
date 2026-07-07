import type {
  ConfigWithOverrides,
} from 'tiny-editorconfig';

/**
 * Wrapper to tiny-editorconfig {@link Parse} function to allow jest mocking
 * @see parse
 * @param input configuration file content
 */
// istanbul ignore next -- tiny-editorconfig wrapper function to handle Jest testing CJS requirement issue
export const editorConfigParse = async (input: string) => {
  try {
    const { parse } = await import('tiny-editorconfig');
    return parse(input);
  } catch {
    return undefined;
  }
};

/**
 * Wrapper to tiny-editorconfig {@link resolve} function to allow jest mocking
 * @see resolve
 * @param configs EditorConfig configurations
 * @param filePath Path to the file to lint
 */
// istanbul ignore next -- tiny-editorconfig wrapper function to handle Jest testing CJS requirement issue
export const editorConfigResolve = async (configs: ConfigWithOverrides[], filePath: string) => {
  try {
    const { resolve } = await import('tiny-editorconfig');
    return resolve(configs, filePath);
  } catch {
    return undefined;
  }
};
