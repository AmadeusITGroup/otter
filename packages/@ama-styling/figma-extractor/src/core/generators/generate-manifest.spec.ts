import type {
  GetLocalVariables200ResponseMeta,
  Style,
} from '@ama-styling/figma-sdk';

describe('generateManifest', () => {
  test('should generate the manifest file content for color and text', async () => {
    const getCollectionFileName = jest.fn().mockReturnValue('test');
    const getStyleFileName = jest.fn().mockImplementation((prefix: string) => `${prefix}.file`);
    jest.mock('../helpers/file-names', () => ({
      getCollectionFileName,
      getStyleFileName
    }));

    const variableCollections = {
      c1: {
        modes: [{ name: 'modeC1-1' }, { name: 'modeC1-2' }],
        name: 'collection1'
      },
      c2: {
        modes: [{ name: 'modeC2-1' }],
        name: 'collection2'
      }
    } as any as GetLocalVariables200ResponseMeta;
    const fakeFile = {
      styles: {
        style0: {
          styleType: 'FILL'
        },
        style1: {
          styleType: 'TEXT'
        },
        style2: {
          styleType: 'TEXT'
        }
      } as any as Record<string, Style>
    };

    const opts = { fileKey: 'test-file' };
    const { generateManifest } = require('./generate-manifest');
    const result = await generateManifest({ variableCollections } as any, Promise.resolve(fakeFile), opts);
    expect(getStyleFileName).toHaveBeenCalledWith('TEXT');
    expect(getStyleFileName).toHaveBeenCalledWith('FILL');
    expect(getStyleFileName).not.toHaveBeenCalledWith('EFFECT');
    expect(result).toEqual({
      collections: {
        collection1: {
          modes: {
            'modeC1-1': ['test'],
            'modeC1-2': ['test']
          }
        },
        collection2: {
          modes: {
            'modeC2-1': ['test']
          }
        }
      },
      name: 'Design Tokens',
      styles: {
        color: ['FILL.file'],
        text: ['TEXT.file']
      }
    });
  });
});
