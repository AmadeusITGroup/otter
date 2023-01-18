import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getProjectFromTree, readAngularJson } from '@o3r/schematics';
import * as commentJson from 'comment-json';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('Playwright Scenario', () => {
  let tree: UnitTestTree;

  const getInitialTree = () => {
    const initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    const workspace = readAngularJson(initialTree);
    const workspaceProject = getProjectFromTree(initialTree);
    const dir = 'e2e-playwright/scenarios';
    const configurationIndex = '@o3r/testing:playwright-scenario';
    workspaceProject.schematics ||= {};
    workspaceProject.schematics[configurationIndex] = {path: dir};
    workspace.projects['test-project'] = workspaceProject;
    initialTree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));

    return initialTree;
  };

  describe('Default parameters', () => {
    beforeAll(async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      tree = await lastValueFrom(runner.runExternalSchematicAsync('schematics', 'playwright-scenario', {
        projectName: 'test-project',
        name: 'test-playwright-scenario'
      }, getInitialTree()));
    });

    it('should generate files', () => {
      expect(tree.files.filter((file) => /test-playwright-scenario\.e2e-playwright-spec\.ts/.test(file)).length).toEqual(1);
    });

    it('should have the default template', () => {
      expect(tree.readContent('/e2e-playwright/scenarios/test-playwright-scenario.e2e-playwright-spec.ts')).toContain('export class TestPlaywrightScenario extends BaseScenario');
      expect(tree.readContent('/e2e-playwright/scenarios/test-playwright-scenario.e2e-playwright-spec.ts')).toContain('public performFlow');
      expect(tree.readContent('/e2e-playwright/scenarios/test-playwright-scenario.e2e-playwright-spec.ts')).toContain('new TestPlaywrightScenario().run()');
    });
  });
});
