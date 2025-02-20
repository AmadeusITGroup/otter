import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';

const otterRenovatePathPrefix = 'github>AmadeusITGroup/otter//';
const withVersionPattern = /#[0-9.]+(?:-.+)?$/;
const supportedRenovateFiles = ['.renovaterc.json', 'renovaterc.json', 'renovate.json'];

export const updateRenovateVersion = (): Rule => {
  const version: string | undefined = JSON.parse(readFileSync(resolve(__dirname, '..', '..', '..', 'package.json'), { encoding: 'utf8' })).version;
  return (tree, context) => {
    if (!version) {
      context.logger.warn('No Otter version detected');
      return tree;
    }
    supportedRenovateFiles
      .filter((renovateFile) => tree.exists(renovateFile))
      .forEach((renovateFile) => {
        const renovateConfig = tree.readJson(renovateFile) as any;
        renovateConfig.extends = renovateConfig.extends?.map((extensionPath: string) => {
          if (!extensionPath.startsWith(otterRenovatePathPrefix) || withVersionPattern.test(extensionPath)) {
            return extensionPath;
          }

          return `${extensionPath}#${version}`;
        });
        tree.overwrite(renovateFile, JSON.stringify(renovateConfig, null, 2));
      });
    return tree;
  };
};
