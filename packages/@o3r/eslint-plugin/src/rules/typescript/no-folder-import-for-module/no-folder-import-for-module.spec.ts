import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  RuleTester,
} from '@typescript-eslint/rule-tester';
import noFolderImportForModule from './no-folder-import-for-module';

const ruleTester = new RuleTester();
const fakeFolder = path.resolve('/fake-folder');

beforeAll(async () => {
  await fs.mkdir(path.join(fakeFolder, 'local'), { recursive: true });
  await fs.mkdir(path.join(fakeFolder, 'empty-local'), { recursive: true });
  await fs.writeFile(path.join(fakeFolder, 'local', 'index.ts'), 'export default {};');
});

ruleTester.run('no-folder-import-for-module', noFolderImportForModule, {
  valid: [
    'import {myImport} from "library";',
    'import {myImportModule} from "library";',
    'import {myImport} from "./local";',
    'import {myImportModule} from "./local/index";'
  ],
  invalid: [
    {
      filename: path.join(fakeFolder, 'test.ts'),
      output: 'import {myImportModule} from "./local/index";',
      code: 'import {myImportModule} from "./local";',
      errors: [
        {
          messageId: 'error',
          line: 1,
          endLine: 1,
          suggestions: [
            {
              messageId: 'indexFile',
              data: {
                newIndexFilePath: './local/index'
              },
              output: 'import {myImportModule} from "./local/index";'
            }
          ]
        }
      ]
    },
    {
      filename: path.join(fakeFolder, 'test.ts'),
      output: 'import {randomImport, myImportModule} from "./local/index";',
      code: 'import {randomImport, myImportModule} from "./local";',
      errors: [
        {
          messageId: 'error',
          line: 1,
          endLine: 1,
          suggestions: [
            {
              messageId: 'indexFile',
              data: {
                newIndexFilePath: './local/index'
              },
              output: 'import {randomImport, myImportModule} from "./local/index";'
            }
          ]
        }
      ]
    },
    {
      filename: path.join(fakeFolder, 'test.ts'),
      code: 'import {myImportModule} from "./empty-local";',
      errors: [
        {
          messageId: 'error',
          line: 1,
          endLine: 1,
          suggestions: []
        }
      ]
    }
  ]
});
