import {
  readFileSync,
} from 'node:fs';
import {
  join,
} from 'node:path';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn().mockImplementation(() => readFileSync(join(__dirname, '../../../package.json'), { encoding: 'utf8' }))
}));

describe('generatePackage', () => {
  test('should generate the NPM package file content', async () => {
    const { generatePackage } = require('./generate-package');
    const result = await generatePackage({ name: 'test', manifestFile: 'manifest-test.json', version: '1.2.3-test' });

    expect(result).toEqual(expect.objectContaining({
      name: 'test',
      version: '1.2.3-test',
      preferUnplugged: true,
      exports: expect.objectContaining({
        '.': {
          default: './manifest-test.json'
        },
        './*.json': {
          default: './*.json'
        }
      })
    }));
  });
});
