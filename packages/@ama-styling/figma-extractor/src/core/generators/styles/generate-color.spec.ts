import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';
import {
  type generateColorStyles as TypeGenerateColorStyles,
} from './generate-color';

describe('generateColorStyles', () => {
  test('should generate the correct color', async () => {
    const getFileMock = jest.fn().mockResolvedValue({
      nodes: {
        styleNode1: {
          document: {
            type: 'FILL',
            fills: [
              {}
            ]
          }
        },
        styleNode2: {
          document: {
            id: 'styleNode2',
            name: 'doc',
            type: 'FILL',
            fills: [
              {
                gradientHandlePositions: 9.99,
                gradientStops: [
                  {
                    position: 1.11,
                    boundVariables: {
                      color: 'testColor'
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    });
    const formatVariables = jest.fn().mockReturnValue('#color');
    const getAngleWithScreenYAxis = jest.fn().mockReturnValue(0);
    const getVariablesFormatter = jest.fn().mockReturnValue(formatVariables);
    const filesApiMock = jest.fn().mockReturnValue({ getFileNodes: getFileMock });

    jest.mock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));
    jest.mock('../../helpers/variable-formatter', () => ({
      getVariablesFormatter
    }));
    jest.mock('../../helpers/vector', () => ({
      getAngleWithScreenYAxis
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
          styleType: 'FILL'
        } as any
      }
    } as any as GetFile200Response;
    const { generateColorStyles } = require('./generate-color') as { generateColorStyles: typeof TypeGenerateColorStyles };

    const styles = await generateColorStyles(testApi, Promise.resolve(fakeFile), {} as any, opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey, ids: 'styleNode2' });
    expect(getAngleWithScreenYAxis).toHaveBeenCalledWith(9.99);
    expect(styles).toEqual({
      doc: {
        $description: 'desc',
        $type: 'gradient',
        $value: {
          angle: 0,
          stops: [{ color: '#color', position: 1.11 }],
          type: undefined
        }
      }
    });
  });
});
