import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';
import {
  type generateTextStyles as TypeGenerateTextStyles,
} from './generate-text';

describe('generateGridStyles', () => {
  test('should generate the correct grid', async () => {
    const getFileMock = jest.fn().mockResolvedValue({
      nodes: {
        styleNode1: {
          document: {
            id: 'styleNode1',
            name: 'doc',
            type: 'TEXT',
            style: {
              fontFamily: '1',
              fontSize: '2',
              fontWeight: '3',
              letterSpacing: '4',
              lineHeight: '5'
            }
          }
        }
      }
    });
    const formatVariables = jest.fn().mockImplementation((value: string) => value);
    const getVariablesFormatter = jest.fn().mockReturnValue(formatVariables);
    const filesApiMock = jest.fn().mockReturnValue({ getFileNodes: getFileMock });
    const getRgbaColorHex = jest.fn().mockReturnValue('#test');

    jest.mock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));
    jest.mock('../../helpers/variable-formatter', () => ({
      getVariablesFormatter
    }));
    jest.mock('../../helpers/color-hex-helpers', () => ({
      getRgbaColorHex
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
          styleType: 'GRID'
        } as any
      }
    } as any as GetFile200Response;
    const { generateTextStyles } = require('./generate-text') as { generateTextStyles: typeof TypeGenerateTextStyles };

    const styles = await generateTextStyles(testApi, Promise.resolve(fakeFile), {} as any, opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey, ids: 'styleNode1' });
    expect(styles).toEqual({
      doc: {
        $description: 'desc',
        $type: 'typography',
        $value: {
          fontFamily: '1',
          fontSize: '2',
          fontWeight: '3',
          letterSpacing: '4',
          lineHeight: '5',
          textDecoration: 'none',
          textTransform: 'none'
        }
      }
    });
  });
});
