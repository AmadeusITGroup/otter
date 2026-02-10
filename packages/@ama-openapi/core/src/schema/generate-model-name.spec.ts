import {
  sanitizePackagePath,
} from '../core/manifest/extract-dependency-models.mjs';
import {
  generateModelNameRef,
  getMaskFileName,
} from './generate-model-name.mjs';

jest.mock('../core/manifest/extract-dependency-models.mjs', () => ({
  sanitizePackagePath: jest.fn()
}));

describe('generateModelNameRef', () => {
  const sanitizePackagePathMock =
    sanitizePackagePath as jest.MockedFunction<typeof sanitizePackagePath>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should build model reference using sanitized artifact name and model file path without inner path', () => {
    sanitizePackagePathMock.mockReturnValue('sanitized-pkg');

    const artifactName = '@scope/my-pkg';
    const modelPath = '/schemas/user.json';

    const result = generateModelNameRef(artifactName, modelPath);

    expect(result).toBe('sanitized-pkg--schemas-user');
  });

  it('should handle innerPath references, replacing separators as expected', () => {
    sanitizePackagePathMock.mockReturnValue('pkg');

    const artifactName = 'my-package';
    const modelPath = 'schemas/user.json#/components/schemas/User';

    const result = generateModelNameRef(artifactName, modelPath);

    expect(result).toBe('pkg-schemas-usercomponents-schemas-User');
  });

  it('should remove leading relative segments and normalize dashes/paths', () => {
    sanitizePackagePathMock.mockReturnValue('pkg_sanitized');

    const artifactName = 'pkg-with-dash';
    const modelPath = './nested-dir/my-model-name.yaml#/inner-path/value';

    const result = generateModelNameRef(artifactName, modelPath);

    expect(result).toBe('pkg_sanitized-nested_dir-my_model_nameinner_path-value');
  });
});

describe('getMaskFileName', () => {
  it('should prefix modelNameRef with mask- and suffix with .json', () => {
    const modelNameRef = 'pkg-schemas-user';
    const result = getMaskFileName(modelNameRef);

    expect(result).toBe('mask-pkg-schemas-user.json');
  });
});
