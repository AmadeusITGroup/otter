import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';
import {
  type generateEffectStyles as TypeGenerateEffectStyles,
} from './generate-effect';

describe('generateEffectStyles', () => {
  test('should generate the correct effect', async () => {
    const getFileMock = jest.fn().mockResolvedValue({
      nodes: {
        styleNode2: {
          document: {
            id: 'styleNode2',
            name: 'doc',
            type: 'EFFECT',
            effects: [
              {
                type: 'DROP_SHADOW',
                boundVariables: {
                  radius: '1',
                  color: '2',
                  offsetX: '3',
                  offsetY: '4',
                  spread: '5'
                }
              },
              {
                type: 'INNER_SHADOW',
                boundVariables: {
                  radius: '5',
                  color: '4',
                  offsetX: '3',
                  offsetY: '2',
                  spread: '1'
                }
              }
            ]
          }
        }
      }
    });
    const formatVariables = jest.fn().mockImplementation((value: string) => value);
    const getVariablesFormatter = jest.fn().mockReturnValue(formatVariables);
    const filesApiMock = jest.fn().mockReturnValue({ getFileNodes: getFileMock });

    jest.mock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));
    jest.mock('../../helpers/variable-formatter', () => ({
      getVariablesFormatter
    }));

    const testApi: any = {};
    const opts = { fileKey: 'test-file' };
    const fakeFile = {
      styles: {
        styleNode1: {
          description: 'desc',
          styleType: 'TEXT'
        } as any,
        styleNode2: {
          description: 'desc',
          styleType: 'EFFECT'
        } as any
      }
    } as any as GetFile200Response;
    const { generateEffectStyles } = require('./generate-effect') as { generateEffectStyles: typeof TypeGenerateEffectStyles };

    const styles = await generateEffectStyles(testApi, Promise.resolve(fakeFile), {} as any, opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey, ids: 'styleNode2' });
    expect(styles).toEqual({
      doc: {
        $description: 'desc',
        $type: 'shadow',
        $value: [
          {
            blur: '1',
            color: '2',
            offsetX: '3',
            offsetY: '4',
            spread: '5',
            inset: false
          },
          {
            blur: '5',
            color: '4',
            offsetX: '3',
            offsetY: '2',
            spread: '1',
            inset: true
          }
        ]
      }
    });
  });
});
