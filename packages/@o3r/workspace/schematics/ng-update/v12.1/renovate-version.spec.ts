/* eslint-disable import/newline-after-import,import/first -- updateRenovateVersion need to be imported after virtualFS */
import {
  join,
} from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  cleanVirtualFileSystem,
  useVirtualFileSystem,
} from '@o3r/test-helpers';
const virtualFileSystem = useVirtualFileSystem();
import {
  updateRenovateVersion,
} from './renovate-version';
/* eslint-enable import/newline-after-import,import/first */

const packageJsonDir = join(__dirname, '..', '..', '..');
const packageJsonPath = join(packageJsonDir, 'package.json');
const renovateFilePath = '.renovaterc.json';

describe('Update renovate version', () => {
  let initialTree: Tree;
  const context = {} as any;

  beforeEach(async () => {
    initialTree = Tree.empty();
    await virtualFileSystem.promises.mkdir(packageJsonDir, { recursive: true });
    await virtualFileSystem.promises.writeFile(packageJsonPath, '{"version": "12.3.4"}');
  });

  afterAll(() => {
    cleanVirtualFileSystem();
  });

  it('should add the version on otter presets', () => {
    initialTree.create(renovateFilePath, JSON.stringify({
      $schema: 'https://docs.renovatebot.com/renovate-schema.json',
      extends: [
        'github>just/another/preset',
        'github>AmadeusITGroup/otter//tools/renovate/base',
        'github>AmadeusITGroup/otter//tools/renovate/group/otter#v12.3.4',
        'github>AmadeusITGroup/otter//tools/renovate/tasks/base',
        'github>AmadeusITGroup/otter//tools/renovate/tasks/otter-ng-update(npm)'
      ]
    }, null, 2));
    const expected = JSON.stringify({
      $schema: 'https://docs.renovatebot.com/renovate-schema.json',
      extends: [
        'github>just/another/preset',
        'github>AmadeusITGroup/otter//tools/renovate/base#v12.3.4',
        'github>AmadeusITGroup/otter//tools/renovate/group/otter#v12.3.4',
        'github>AmadeusITGroup/otter//tools/renovate/tasks/base#v12.3.4',
        'github>AmadeusITGroup/otter//tools/renovate/tasks/otter-ng-update#v12.3.4(npm)'
      ]
    }, null, 2);
    const outputTree = updateRenovateVersion()(initialTree, context) as Tree;
    expect(outputTree.readText(renovateFilePath)).toBe(expected);
  });
});
