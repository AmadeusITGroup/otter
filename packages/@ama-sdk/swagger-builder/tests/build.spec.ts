import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  buildSpecs,
} from '../src/helpers/build';

const expectPath = path.resolve(__dirname, 'mocks-build');
const resourcePath = path.resolve(__dirname, 'mocks-build');
const resultPath = path.resolve(__dirname, '..', 'test-results', 'build');

describe('Swagger Builder', () => {
  it('should build a split spec', async () => {
    const resourceFolder = path.join(resourcePath, 'resource1');
    const expectFolder = path.resolve(expectPath, 'expect1');
    await buildSpecs({
      output: path.join(resultPath, 'result1'),
      outputFormat: 'yaml'
    }, [path.join(resourceFolder, 'spec/generate.config.json')]);

    expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result1.yaml'), { encoding: 'utf8' }));
  });

  it('should build a split spec with multiple template', async () => {
    const resourceFolder = path.join(resourcePath, 'resource8');
    const expectFolder = path.resolve(expectPath, 'expect8');
    await buildSpecs({
      output: path.join(resultPath, 'result8'),
      outputFormat: 'yaml'
    }, [path.join(resourceFolder, 'spec/generate.config.json')]);

    expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result8.yaml'), { encoding: 'utf8' }));
  });

  describe('should merge', () => {
    it('two YAML specs', async () => {
      const resourceFolder = path.join(resourcePath, 'resource2');
      const expectFolder = path.resolve(expectPath, 'expect2');
      await buildSpecs({
        output: path.join(resultPath, 'result2'),
        outputFormat: 'yaml'
      }, [path.join(resourceFolder, 'spec1.yaml'), path.join(resourceFolder, 'spec2.yaml')]);

      expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result2.yaml'), { encoding: 'utf8' }));
    });

    it('three YAML specs', async () => {
      const resourceFolder = path.join(resourcePath, 'resource3');
      const expectFolder = path.resolve(expectPath, 'expect3');
      await buildSpecs({
        output: path.join(resultPath, 'result3'),
        outputFormat: 'yaml'
      }, [path.join(resourceFolder, 'spec1.yaml'), path.join(resourceFolder, 'spec2.yaml'), path.join(resourceFolder, 'spec3.yaml')]);

      expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result3.yaml'), { encoding: 'utf8' }));
    });

    it('one YAML file with one split spec', async () => {
      const resourceFolder = path.join(resourcePath, 'resource4');
      const expectFolder = path.resolve(expectPath, 'expect4');
      await buildSpecs({
        output: path.join(resultPath, 'result4'),
        outputFormat: 'yaml'
      }, [path.join(resourceFolder, 'spec1.yaml'), path.join(resourceFolder, 'spec2/generate.config.json')]);

      expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result4.yaml'), { encoding: 'utf8' }));
    });

    describe('two YAML specs and', () => {
      it('should override definitions', async () => {
        const resourceFolder = path.join(resourcePath, 'resource5');
        const expectFolder = path.resolve(expectPath, 'expect5');
        await buildSpecs({
          output: path.join(resultPath, 'result5'),
          outputFormat: 'yaml'
        }, [path.join(resourceFolder, 'spec1.yaml'), path.join(resourceFolder, 'spec2.yaml')]);

        expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result5.yaml'), { encoding: 'utf8' }));
      });

      it('should merge definitions', async () => {
        const resourceFolder = path.join(resourcePath, 'resource6');
        const expectFolder = path.resolve(expectPath, 'expect6');
        await buildSpecs({
          buildMdkSpec: true,
          output: path.join(resultPath, 'result6'),
          outputFormat: 'yaml'
        }, [path.join(resourceFolder, 'spec1.yaml'), path.join(resourceFolder, 'spec2.yaml')]);

        expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result6.yaml'), { encoding: 'utf8' }));
      });

      it('should fail on non expected conflict on paths', async () => {
        const resourceFolder = path.join(resourcePath, 'resource7');
        await expect(() => buildSpecs({
          output: path.join(resultPath, 'result7'),
          outputFormat: 'yaml'
        }, [path.join(resourceFolder, 'spec1.yaml'), path.join(resourceFolder, 'spec2.yaml')])).rejects.toBeDefined();
      });

      it('should success on expected conflict on paths', async () => {
        const resourceFolder = path.join(resourcePath, 'resource7');
        const expectFolder = path.resolve(expectPath, 'expect7');
        await buildSpecs({
          output: path.join(resultPath, 'result7'),
          outputFormat: 'yaml',
          ignoreConflict: true
        }, [path.join(resourceFolder, 'spec1.yaml'), path.join(resourceFolder, 'spec2.yaml')]);

        expect(fs.readFileSync(path.resolve(expectFolder, 'spec.yaml'), { encoding: 'utf8' })).toEqual(fs.readFileSync(path.resolve(resultPath, 'result7.yaml'), { encoding: 'utf8' }));
      });
    });
  });
});
