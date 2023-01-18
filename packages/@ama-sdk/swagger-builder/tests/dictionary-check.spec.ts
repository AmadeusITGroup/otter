import * as path from 'node:path';
import { checkDictionaries } from '../src/helpers/dictionary-check';

const resourcePath = path.resolve(__dirname, 'mocks-dictionary-check');

describe('Swagger Dictionary Check', () => {
  it('should fail if a dictionary is missing', async () => {
    const resourceFolder = path.join(resourcePath, 'resource1');
    const report = await checkDictionaries([path.join(resourceFolder, 'spec.yaml')]);
    const hasFailed = !!Object.keys(report).length;

    expect(hasFailed).toBeTruthy();
  });

  it('should succeed if no missing dictionary', async () => {
    const resourceFolder = path.join(resourcePath, 'resource2');
    const report = await checkDictionaries([path.join(resourceFolder, 'spec.yaml')]);
    const hasFailed = !!Object.keys(report).length;

    expect(hasFailed).toBeFalsy();
  });

});
