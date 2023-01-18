import * as path from 'node:path';
import * as fs from 'node:fs';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import noFolderImportForModule from './no-folder-import-for-module';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  }
});

beforeAll(() => {
  fs.mkdirSync(path.resolve(__dirname, 'local'));
  fs.mkdirSync(path.resolve(__dirname, 'empty-local'));
  fs.writeFileSync(path.resolve(__dirname, 'local', 'index.ts'), 'export default {};');
});

afterAll(() => {
  fs.unlinkSync(path.resolve(__dirname, 'local', 'index.ts'));
  fs.rmdirSync(path.resolve(__dirname, 'local'));
  fs.rmdirSync(path.resolve(__dirname, 'empty-local'));
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
      filename: path.resolve(__dirname, 'test.ts'),
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
      filename: path.resolve(__dirname, 'test.ts'),
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
      filename: path.resolve(__dirname, 'test.ts'),
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
