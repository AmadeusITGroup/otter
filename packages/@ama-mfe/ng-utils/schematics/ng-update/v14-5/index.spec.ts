import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

const migrationPath = path.join(__dirname, '..', '..', '..', 'migration.json');
const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Update v14.5', () => {
  let initialTree: Tree;
  let runner: SchematicTestRunner;

  beforeEach(() => {
    initialTree = Tree.empty();
    runner = new SchematicTestRunner('@ama-mfe/ng-utils', migrationPath);
    runner.registerCollection('schematics', collectionPath);
  });

  it('should append .start() to a known consumer injected in app.config.ts', async () => {
    initialTree.create('src/app/app.config.ts', `
      import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
      import { NavigationConsumerService } from '@ama-mfe/ng-utils';

      export const appConfig: ApplicationConfig = {
        providers: [
          provideAppInitializer(() => inject(NavigationConsumerService))
        ]
      };
    `);
    const tree = await runner.runSchematic('migration-v14_5', {}, initialTree);
    const content = tree.readText('src/app/app.config.ts');
    expect(content).toContain('inject(NavigationConsumerService).start()');
  });

  it('should append .start() to several known consumers', async () => {
    initialTree.create('src/app/app.config.ts', `
      import { inject } from '@angular/core';
      import { NavigationConsumerService, ThemeConsumerService } from '@ama-mfe/ng-utils';

      const nav = inject(NavigationConsumerService);
      const theme = inject(ThemeConsumerService);
    `);
    const tree = await runner.runSchematic('migration-v14_5', {}, initialTree);
    const content = tree.readText('src/app/app.config.ts');
    expect(content).toContain('inject(NavigationConsumerService).start()');
    expect(content).toContain('inject(ThemeConsumerService).start()');
  });

  it('should be idempotent when .start() is already present', async () => {
    const source = `
      import { inject } from '@angular/core';
      import { HistoryConsumerService } from '@ama-mfe/ng-utils';

      const history = inject(HistoryConsumerService).start();
    `;
    initialTree.create('src/app/app.config.ts', source);
    const tree = await runner.runSchematic('migration-v14_5', {}, initialTree);
    const content = tree.readText('src/app/app.config.ts');
    expect(content).toBe(source);
    expect(content.match(/\.start\(\)/g)).toHaveLength(1);
  });

  it('should not touch consumers that are not injected', async () => {
    const source = `
      import { ApplicationConfig } from '@angular/core';

      export const appConfig: ApplicationConfig = {
        providers: []
      };
    `;
    initialTree.create('src/app/app.config.ts', source);
    const tree = await runner.runSchematic('migration-v14_5', {}, initialTree);
    expect(tree.readText('src/app/app.config.ts')).toBe(source);
  });

  it('should also process main.ts', async () => {
    initialTree.create('src/main.ts', `
      import { inject } from '@angular/core';
      import { ResizeConsumerService } from '@ama-mfe/ng-utils';

      const resize = inject(ResizeConsumerService);
    `);
    const tree = await runner.runSchematic('migration-v14_5', {}, initialTree);
    expect(tree.readText('src/main.ts')).toContain('inject(ResizeConsumerService).start()');
  });
});
