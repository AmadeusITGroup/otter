import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';
import {
  type generateTextStyles as TypeGenerateTextStyles,
} from './generate-text';

describe('generateGridStyles', () => {
  test('should generate the correct grid', async () => {
    const getFileMock = vi.fn().mockResolvedValue({
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
    const formatVariables = vi.fn().mockImplementation((value: string) => value);
    const getVariablesFormatter = vi.fn().mockReturnValue(formatVariables);
    const filesApiMock = vi.fn(class {
      constructor() {
        return { getFileNodes: getFileMock };
      }
    });
    const getRgbaColorHex = vi.fn().mockReturnValue('#test');

    vi.doMock('@ama-styling/figma-sdk', () => ({
      FilesApi: filesApiMock
    }));
    vi.doMock('../../helpers/variable-formatter', () => ({
      getVariablesFormatter
    }));
    vi.doMock('../../helpers/color-hex-helpers', () => ({
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
    const { generateTextStyles } = (await import('./generate-text')) as { generateTextStyles: typeof TypeGenerateTextStyles };

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
