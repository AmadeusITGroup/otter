import {
  promises as fs
} from 'node:fs';
import * as path from 'node:path';
import type {
  PackageJson
} from 'type-fest';

/** Get generator package.json */
export const readPackageJson = async <T extends PackageJson & { generatorDependencies: Record<string, string> }>(): Promise<T> => {
  const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

  return JSON.parse(await fs.readFile(packageJsonPath, { encoding: 'utf8' }));
};
