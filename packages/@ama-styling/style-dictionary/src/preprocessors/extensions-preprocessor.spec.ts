import {
  OTTER_EXTENSIONS_NODE_NAME,
  OTTER_NAME_PREFIX,
} from '../constants.mjs';
import type {
  DesignTokenExtensions,
} from '../interfaces/extensions-interface.mjs';
import {
  extensionPropagatePreprocessor,
} from './extensions-preprocessor.mjs';

describe('extensionPropagatePreprocessor', () => {
  test('should have otter prefix', () => {
    expect(extensionPropagatePreprocessor.name).toMatch(new RegExp(`^${OTTER_NAME_PREFIX}`));
  });

  test('should ignore $extension when Dtcg option not activated', async () => {
    const tokens = await extensionPropagatePreprocessor.preprocessor({
      token: {
        value: '0px',
        $extensions: {
          o3rPrivate: true
        } satisfies DesignTokenExtensions
      }
    }, { usesDtcg: false });

    expect(tokens.token).toBeDefined();
    expect(tokens.token.attributes).not.toBeDefined();
  });

  test('should convert $extension when Dtcg option activated', async () => {
    const tokens = await extensionPropagatePreprocessor.preprocessor({
      token: {
        $value: '0px',
        $extensions: {
          o3rPrivate: true
        } satisfies DesignTokenExtensions
      }
    }, { usesDtcg: true });

    expect(tokens.token).toBeDefined();
    expect(tokens.token.attributes).toBeDefined();
    expect(tokens.token.attributes.o3rPrivate).toBeDefined();
    expect(tokens.token.attributes.private).toBeDefined();
  });

  test('should convert $extension in deep node', async () => {
    const tokens = await extensionPropagatePreprocessor.preprocessor({
      node: {
        token: {
          $value: '0px',
          $extensions: {
            o3rPrivate: true
          } satisfies DesignTokenExtensions
        },
        token2: {
          $value: '0px',
          $extensions: {
            o3rImportant: true
          } satisfies DesignTokenExtensions
        }
      }
    }, { usesDtcg: true });

    expect(tokens.node.token).toBeDefined();
    expect(tokens.node.token.attributes).toBeDefined();
    expect(tokens.node.token.attributes.o3rPrivate).toBeDefined();
    expect(tokens.node.token.attributes.private).toBeDefined();
    expect(tokens.node.token2).toBeDefined();
    expect(tokens.node.token2.attributes).toBeDefined();
    expect(tokens.node.token2.attributes.o3rImportant).toBeDefined();
  });

  test('should define properly themeable attribute', async () => {
    const tokens = await extensionPropagatePreprocessor.preprocessor({
      token: {
        $value: '0px',
        $extensions: {
          o3rExpectOverride: true
        } satisfies DesignTokenExtensions
      }
    }, { usesDtcg: true });

    expect(tokens.token).toBeDefined();
    expect(tokens.token.themeable).toBe(true);
  });

  test('should properly merge the metadata', async () => {
    const tokens = await extensionPropagatePreprocessor.preprocessor({
      token: {
        $value: '0px',
        attributes: {
          o3rMetadata: {
            label: 'test1'
          }
        } satisfies DesignTokenExtensions,
        $extensions: {
          o3rMetadata: {
            category: 'test2'
          }
        } satisfies DesignTokenExtensions
      }
    }, { usesDtcg: true });

    expect(tokens.token).toBeDefined();
    expect(tokens.token.attributes).toBeDefined();
    expect(tokens.token.attributes.o3rMetadata.label).toBe('test1');
    expect(tokens.token.attributes.o3rMetadata.category).toBe('test2');
  });

  test('should add extension from external file', async () => {
    const tokens = await extensionPropagatePreprocessor.preprocessor({
      node: {
        token: {
          $value: '0px'
        }
      },
      [OTTER_EXTENSIONS_NODE_NAME]: {
        node: {
          token: {
            $extensions: {
              o3rPrivate: true
            }
          }
        }
      }
    }, { usesDtcg: true });

    expect(tokens.node.token).toBeDefined();
    expect(tokens.node.token.attributes).toBeDefined();
    expect(tokens.node.token.attributes.o3rPrivate).toBe(true);
    expect(tokens.node.token.attributes.private).toBe(true);
  });
});
