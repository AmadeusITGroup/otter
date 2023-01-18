import {BuilderOutput, createBuilder} from '@angular-devkit/architect';
import * as fs from 'node:fs';
import * as path from 'node:path';

import {PatternReplacementBuilderSchema} from './schema';

export default createBuilder<PatternReplacementBuilderSchema>(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();
  const STEP_NUMBER = options.files.length + 1;
  context.reportProgress(1, STEP_NUMBER, 'Checking that all files exist');

  const fileNames = options.files.map((fileName) => path.resolve(context.workspaceRoot, fileName));
  const inexistingFile = fileNames.find((filePath) => !fs.existsSync(filePath));
  if (inexistingFile) {
    return {
      success: false,
      error: `${inexistingFile} not found`
    };
  }
  for (let i = 0; i < fileNames.length; i++) {
    const filePath = fileNames[i];
    context.reportProgress(i + 1, STEP_NUMBER, `Modifying ${filePath}`);
    const fileContent = await new Promise<string>((resolve, reject) =>
      fs.readFile(
        filePath,
        {encoding: 'utf-8'},
        (err, data) => err ? reject(err) : resolve(data)
      )
    );
    const newContent = fileContent.replace(new RegExp(options.searchValue, 'g'), options.replaceValue);

    await new Promise<void>((resolve, reject) =>
      fs.writeFile(
        filePath,
        newContent,
        (err) => err ? reject(err) : resolve()
      )
    );
  }

  return {
    success: true
  };
});
