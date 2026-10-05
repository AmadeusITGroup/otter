import type {
  GetFile200Response,
} from '@ama-styling/figma-sdk';
import {
  type generateGridStyles as TypeGenerateGridStyles,
} from './generate-grid';

describe('generateGridStyles', () => {
  test('should generate the correct grid', async () => {
    const getFileMock = vi.fn().mockResolvedValue({
      nodes: {
        styleNode2: {
          document: {
            id: 'styleNode2',
            name: 'doc',
            type: 'GRID',
            layoutGrids: [
              {
                pattern: '1',
                visible: true,
                alignment: '2',
                color: '3',
                gutterSize: '4',
                count: 1,
                offset: '5'
              }
            ]
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
    const { generateGridStyles } = (await import('./generate-grid')) as { generateGridStyles: typeof TypeGenerateGridStyles };

    const styles = await generateGridStyles(testApi, Promise.resolve(fakeFile), {} as any, opts);
    expect(filesApiMock).toHaveBeenCalled();
    expect(getFileMock).toHaveBeenCalledWith({ file_key: opts.fileKey, ids: 'styleNode2' });
    expect(styles).toEqual({
      doc: {
        $description: 'desc',
        $type: 'grid',
        $value: [
          {
            alignment: '2',
            color: '#test',
            count: 1,
            gutterSize: '4px',
            offset: '5px',
            pattern: '1',
            visible: true
          }
        ]
      }
    });
  });
});
