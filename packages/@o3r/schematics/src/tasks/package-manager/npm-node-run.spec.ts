import {
  NodeRunScriptTask,
} from './npm-node-run';

describe('NodeRunScriptTask', () => {
  test('should use the correct working directory and provided package manager', () => {
    const task1 = new NodeRunScriptTask('', 'test-directory-1', 'npm');
    const task2 = new NodeRunScriptTask('', 'test-directory-2', 'yarn');
    const config1: any = task1.toConfiguration();
    const config2: any = task2.toConfiguration();

    expect(config1.options.command).toBe('exec');
    expect(config1.options.workingDirectory).toBe('test-directory-1');
    expect(config1.options.packageManager).toBe('npm');

    expect(config2.options.command).toBe('exec');
    expect(config2.options.workingDirectory).toBe('test-directory-2');
    expect(config2.options.packageManager).toBe('yarn');
  });

  describe('script', () => {
    const scriptToRun = `console.log('test mesagge with "double quotes" and \\'single quote\\'.')`;

    test('should generate proper command in npm context', () => {
      const task = new NodeRunScriptTask(scriptToRun, undefined, 'npm');
      expect(task.toConfiguration().options.packageName)
        .toBe(`exec --call "node -e \\"console.log('test mesagge with ' + String.fromCharCode(34) + 'double quotes' + String.fromCharCode(34) + ' and \\'single quote\\'.')\\""`);
    });

    test('should generate proper command in yarn context', () => {
      const task = new NodeRunScriptTask(scriptToRun, undefined, 'yarn');
      expect(task.toConfiguration().options.packageName)
        .toBe(`node -e "console.log('test mesagge with \\"double quotes\\" and \\\\'single quote\\\\'.')"`);
    });
  });
});
