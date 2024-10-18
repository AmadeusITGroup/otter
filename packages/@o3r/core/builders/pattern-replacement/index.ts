import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import {
  createBuilderWithMetricsIfInstalled
} from '../utils';
import {
  PatternReplacementBuilderSchema
} from './schema';

export default createBuilder<PatternReplacementBuilderSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();
  const STEP_NUMBER = options.files.length + 1;
  context.reportProgress(1, STEP_NUMBER, 'Checking that all files exist');

  const fileNames = options.files.map((fileName) => path.resolve(context.workspaceRoot, fileName));
  const unexistingFile = fileNames.find((filePath) => !fs.existsSync(filePath));
  if (unexistingFile) {
    return {
      success: false,
      error: `${unexistingFile} not found`
    };
  }
  for (const [i, filePath] of fileNames.entries()) {
    context.reportProgress(i + 1, STEP_NUMBER, `Modifying ${filePath}`);
    const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf8' });
    const newContent = fileContent.replace(new RegExp(options.searchValue, 'g'), options.replaceValue);

    await fs.promises.writeFile(filePath, newContent);
  }

  return {
    success: true
  };
}));
