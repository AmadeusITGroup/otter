import { cleanVirtualFileSystem, useVirtualFileSystem } from '@o3r/test-helpers';
import typescriptParser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

const virtualFileSystem = useVirtualFileSystem();
import noFolderImportForModule from './no-folder-import-for-module';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module'
    }
  }
});
const fakeFolder = path.resolve('/fake-folder');

beforeAll(async () => {
  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'local'), {recursive: true});
  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'empty-local'), {recursive: true});
  await virtualFileSystem.promises.writeFile(path.join(fakeFolder, 'local', 'index.ts'), 'export default {};');
});

afterAll(() => {
  cleanVirtualFileSystem();
});

ruleTester.run('no-folder-import-for-module', noFolderImportForModule, {
  valid: [
    'import {myImport} from "library";',
    'import {myImportModule} from "library";',
    'import {myImport} from "./local";',
    'import {myImportModule} from "./local/index";',
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
          endLine: 1
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
          endLine: 1
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
          endLine: 1
        }
      ]
    }
  ]
});
