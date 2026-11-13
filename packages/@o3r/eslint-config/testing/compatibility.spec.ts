import {
  execFileSync,
} from 'node:child_process';
import {
  join,
} from 'node:path';
import type {
  Linter,
} from 'eslint';

describe.each(['eslint', 'eslint-v10'])('%s compatibility', (eslintPackage) => {
  let results: Record<string, Linter.LintMessage[]>;
  let fixedSources: Record<string, string>;

  beforeAll(() => {
    // Load ESM plugins through Node's native require rather than Jest's module loader.
    const output = execFileSync(process.execPath, ['-e', `
      const { mkdtempSync, rmSync, writeFileSync } = require('node:fs');
      const { tmpdir } = require('node:os');
      const { join } = require('node:path');
      const { ESLint } = require(process.argv[1]);
      const config = require('./src/rules/typescript.cjs');
      const template = require('./src/rules/template.cjs');
      const jsonParser = require('jsonc-eslint-parser');
      const yamlParser = require('yaml-eslint-parser');
      const o3r = require('@o3r/eslint-plugin');
      const directory = mkdtempSync(join(tmpdir(), 'otter-eslint-'));

      const options = {
        cwd: directory,
        overrideConfigFile: true,
        overrideConfig: [
          ...config,
          ...template,
          {
            files: ['**/*.ts'],
            languageOptions: {
              parserOptions: {
                project: join(directory, 'tsconfig.json'),
                tsconfigRootDir: directory
              }
            }
          },
          {
            files: ['**/*.html'],
            rules: {
              '@o3r/template-async-number-limitation': ['error', { maximumAsyncOnTag: 1 }]
            }
          },
          {
            files: ['**/*.json'],
            languageOptions: { parser: jsonParser },
            plugins: { '@o3r': o3r },
            rules: { '@o3r/project-json-tags': 'error' }
          },
          {
            files: ['**/*.yml'],
            languageOptions: { parser: yamlParser },
            plugins: { '@o3r': o3r },
            rules: { '@o3r/yarnrc-package-extensions-harmonize': 'error' }
          }
        ]
      };
      const eslint = new ESLint(options);

      const sources = {
        'example.js': [
          "import { join } from 'node:path';",
          "import { readFileSync } from 'node:fs';",
          "import { missing } from './dependency.js';",
          '',
          '/** @param {string} filename */',
          'export const load = function (filename) {',
          "  return readFileSync(join(filename, missing), 'utf8');",
          '};'
        ].join('\\n'),
        'example.ts': 'export interface Config extends Configuration { value: string | number; }',
        'example.html': '<div [title]="first | async" [id]="second | async"></div>',
        'project.json': '{"tags": "invalid"}',
        'example.yml': 'packageExtensions:\\n  "consumer@*":\\n    dependencies:\\n      example: ^1.0.0'
      };

      (async () => {
        try {
          writeFileSync(join(directory, 'tsconfig.json'), JSON.stringify({
            compilerOptions: { strict: true, target: 'ES2020' },
            include: ['*.ts']
          }));
          for (const [filePath, source] of Object.entries(sources)) {
            writeFileSync(join(directory, filePath), source);
          }
          writeFileSync(join(directory, 'dependency.js'), 'export const available = true;');
          writeFileSync(join(directory, 'package.json'), JSON.stringify({
            name: 'eslint-compatibility-fixture',
            workspaces: [],
            dependencies: { example: '^2.0.0' }
          }));
          const messages = {};
          for (const [filePath, source] of Object.entries(sources)) {
            const [result] = await eslint.lintText(source, { filePath });
            messages[filePath] = result.messages;
          }
          const fixer = new ESLint({ ...options, fix: true });
          const fixedSources = {};
          for (const filePath of ['example.js', 'example.yml']) {
            const [result] = await fixer.lintText(sources[filePath], { filePath });
            fixedSources[filePath] = result.output;
          }
          process.stdout.write(JSON.stringify({ messages, fixedSources }));
        } finally {
          rmSync(directory, { recursive: true, force: true });
        }
      })().catch((error) => {
        console.error(error);
        process.exitCode = 1;
      });
    `, eslintPackage], {
      cwd: join(__dirname, '..'),
      encoding: 'utf8'
    });
    const parsed = JSON.parse(output) as {
      messages: Record<string, Linter.LintMessage[]>;
      fixedSources: Record<string, string>;
    };
    results = parsed.messages;
    fixedSources = parsed.fixedSources;
  });

  it('runs the legacy import, import-newlines, prefer-arrow and JSDoc rules', () => {
    expect(results['example.js']).toEqual(expect.arrayContaining([
      expect.objectContaining({ ruleId: 'import/order' }),
      expect.objectContaining({ ruleId: 'import/named' }),
      expect.objectContaining({ ruleId: 'import-newlines/enforce' }),
      expect.objectContaining({ ruleId: 'prefer-arrow/prefer-arrow-functions' }),
      expect.objectContaining({ ruleId: 'jsdoc/require-description' })
    ]));
  });

  it('runs Otter TypeScript rules', () => {
    expect(results['example.ts']).toContainEqual(expect.objectContaining({
      ruleId: '@o3r/no-multiple-type-configuration-property'
    }));
  });

  it('runs Otter Angular template rules', () => {
    expect(results['example.html']).toContainEqual(expect.objectContaining({
      ruleId: '@o3r/template-async-number-limitation',
      messageId: 'tooManyAsyncOnTag'
    }));
  });

  it('runs Otter JSON rules', () => {
    expect(results['project.json']).toContainEqual(expect.objectContaining({
      ruleId: '@o3r/project-json-tags',
      messageId: 'tagsNotArray'
    }));
  });

  it('runs Otter YAML rules', () => {
    expect(results['example.yml']).toContainEqual(expect.objectContaining({
      ruleId: '@o3r/yarnrc-package-extensions-harmonize',
      messageId: 'error'
    }));
  });

  it('fixes imports and YAML dependency versions', () => {
    expect(fixedSources['example.js']).toContain("import {\n  readFileSync,\n} from 'node:fs';");
    expect(fixedSources['example.yml']).toContain('example: ^2.0.0');
  });
});
