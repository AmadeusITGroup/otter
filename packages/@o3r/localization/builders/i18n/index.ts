import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import * as fs from 'node:fs';
import { sync as globbySync } from 'globby';
import * as path from 'node:path';

import {I18nBuilderSchema} from './schema';

export default createBuilder<I18nBuilderSchema>((options: I18nBuilderSchema, context: BuilderContext): BuilderOutput => {
  const posixWorkspaceRoot = context.workspaceRoot.split(path.sep).join(path.posix.sep);

  options.localizationConfigs.forEach((config) => {
    const fileNames = globbySync(config.localizationFiles.map((files: string) => path.posix.join(posixWorkspaceRoot, files)));

    fileNames.forEach((filePath) => {
      const localizationJson: Record<string, any> = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf-8'}));

      const newContent = JSON.stringify(
        Object.entries(localizationJson)
          .filter(([, value]) => !value.dictionary && !value.$ref && value.defaultValue !== undefined)
          .sort((a, b) => a[0] < b[0] ? -1 : 1)
          .reduce((acc: {[key: string]: string}, [key, {defaultValue}]) => {
            acc[key] = defaultValue;
            return acc;
          }, {}),
        null,
        2
      );

      const dir = path.dirname(filePath);
      const i18nPath = path.join(dir, config.i18nFolderPath);

      if (!fs.existsSync(i18nPath)) {
        fs.mkdirSync(i18nPath, {
          recursive: true
        });
      }

      const defaultLanguageFile = path.join(i18nPath, options.defaultLanguageFile);
      fs.writeFileSync(defaultLanguageFile, newContent + '\n');
    });
  });

  return {
    success: true
  };
});
