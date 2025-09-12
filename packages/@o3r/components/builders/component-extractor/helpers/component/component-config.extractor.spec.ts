import {
  logging,
} from '@angular-devkit/core';
import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualCompilerHost,
} from '@typescript/vfs';
import ts from 'typescript';
import {
  ComponentConfigExtractor,
} from './component-config.extractor';

const createProgramWithVirtualFs = (configFileName: string, configFileContent: string): ts.Program => {
  const compilerOptions: ts.CompilerOptions = { target: ts.ScriptTarget.ES2015 };
  const fsMap = createDefaultMapFromNodeModules(compilerOptions);
  fsMap.set(configFileName, configFileContent);

  const system = createSystem(fsMap);
  const host = createVirtualCompilerHost(system, compilerOptions, ts);

  const program = ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost
  });
  program.emit();
  return program;
};

const runExtractionForPath = (configFilePath: string, configFileContent: string, logger: logging.LoggerApi): any => {
  const program = createProgramWithVirtualFs(configFilePath, configFileContent);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(configFilePath);

  const componentConfigExtractor = new ComponentConfigExtractor(
    '@my-library',
    false,
    source,
    logger,
    configFilePath,
    checker,
    []
  );

  return componentConfigExtractor.extract();
};

describe('ComponentConfigExtractor', () => {
  describe('extract', () => {
    it('should extract component configuration', () => {
      const logger: logging.LoggerApi = new logging.Logger('foo');

      const configurationFilePath = 'my-component.config.ts';
      const configurationFileContent = `
        import { Configuration, NestedConfiguration } from '@o3r/core';

        interface MyNestedConfig extends NestedConfiguration {
          nestedString: string;
        };

        interface MyConfig extends Configuration {
          myBool: boolean;
          myInt: number;
          myString: string;
          myArray: string[];
          myNestedConfig: MyNestedConfig[];
        };

        const DEFAULT_CONFIG: MyConfig = {
          myBool: true,
          myInt: 42,
          myString: 'Hello, world!',
          myArray: ['foo', 'bar'],
          myNestedConfig: [{nestedString: 'nested'}]
        };
      `;

      const configuration = runExtractionForPath(configurationFilePath, configurationFileContent, logger);

      expect(configuration).toEqual({
        nestedConfiguration: [{
          isApplicationConfig: false,
          name: 'MyNestedConfig',
          properties: [
            {
              description: '',
              label: 'nested String',
              name: 'nestedString',
              type: 'string',
              value: ''
            }
          ]
        }],
        unionTypeStringLiteral: [],
        configurationInformation: {
          name: 'MyConfig',
          properties: [
            {
              description: '',
              label: 'my Bool',
              name: 'myBool',
              type: 'boolean',
              value: 'true'
            },
            {
              description: '',
              label: 'my Int',
              name: 'myInt',
              type: 'number',
              value: '42'
            },
            {
              description: '',
              label: 'my String',
              name: 'myString',
              type: 'string',
              value: 'Hello, world!'
            },
            {
              description: '',
              label: 'my Array',
              name: 'myArray',
              type: 'string[]',
              values: ['foo', 'bar']
            },
            {
              description: '',
              label: 'my Nested Config',
              name: 'myNestedConfig',
              type: 'element[]',
              reference: {
                library: '@my-library',
                name: 'MyNestedConfig'
              },
              values: [{ nestedString: 'nested' }]
            }
          ],
          isApplicationConfig: false
        }
      });
    });

    it('should not extract component configuration with an unsupported default value', () => {
      const logger: logging.LoggerApi = new logging.Logger('foo');
      logger.warn = jest.fn();

      const configurationFilePath = 'my-component.config.ts';
      const configurationFileContent = `
        import { Configuration } from '@o3r/core';

        const foo = {bar: 'baz'};

        interface MyConfig extends Configuration {
          myInvalidDefault: string;
        };

        const DEFAULT_CONFIG: MyConfig = {
          myInvalidDefault: foo.bar
        };
      `;

      const configuration = runExtractionForPath(configurationFilePath, configurationFileContent, logger);
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(`Unsupported type found will be ignored with kind = ${ts.SyntaxKind.PropertyAccessExpression} and value = foo.bar`);
      expect(configuration).toEqual({
        nestedConfiguration: [],
        unionTypeStringLiteral: [],
        configurationInformation: {
          name: 'MyConfig',
          properties: [
            {
              description: '',
              label: 'my Invalid Default',
              name: 'myInvalidDefault',
              type: 'string'
            }
          ],
          isApplicationConfig: false
        }
      });
    });

    it('should not extract component configuration with an unsupported default value (in array)', () => {
      const logger: logging.LoggerApi = new logging.Logger('foo');
      logger.warn = jest.fn();

      const configurationFilePath = 'my-component.config.ts';
      const configurationFileContent = `
        import { Configuration } from '@o3r/core';

        const foo = {
          bar: 'baz',
          foo: 'bar'
        };

        interface MyConfig extends Configuration {
          myInvalidDefaultArray: string[];
        };

        const DEFAULT_CONFIG: MyConfig = {
          myInvalidDefaultArray: [foo.bar, foo.foo]
        };
      `;

      const configuration = runExtractionForPath(configurationFilePath, configurationFileContent, logger);
      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith(`Unsupported type found will be ignored with kind = ${ts.SyntaxKind.PropertyAccessExpression} and value = foo.bar`);
      expect(logger.warn).toHaveBeenCalledWith(`Unsupported type found will be ignored with kind = ${ts.SyntaxKind.PropertyAccessExpression} and value = foo.foo`);
      expect(configuration).toEqual({
        nestedConfiguration: [],
        unionTypeStringLiteral: [],
        configurationInformation: {
          name: 'MyConfig',
          properties: [
            {
              description: '',
              label: 'my Invalid Default Array',
              name: 'myInvalidDefaultArray',
              type: 'string[]',
              values: []
            }
          ],
          isApplicationConfig: false
        }
      });
    });
  });
});
