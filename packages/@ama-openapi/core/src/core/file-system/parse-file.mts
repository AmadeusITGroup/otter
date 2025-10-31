import {
  promises as fs,
} from 'node:fs';
import {
  load,
} from 'js-yaml';

/**
 * Check if the file is a JSON file
 * @param filePath
 */
export const isJsonFile = (filePath: string): boolean => {
  return filePath.toLowerCase().endsWith('.json');
};

/**
 *n Parse a file content based on its extension
 * @param filePath
 */
export const parseFile = async <S,>(filePath: string): Promise<S> => {
  const content = await fs.readFile(filePath, { encoding: 'utf8' });
  return (isJsonFile(filePath)
    ? JSON.parse(content)
    : load(content)) as S;
};
