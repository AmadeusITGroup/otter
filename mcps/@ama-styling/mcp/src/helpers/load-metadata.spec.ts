import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  loadMetadata,
} from './load-metadata';

const { readFileMock } = vi.hoisted(() => ({
  readFileMock: vi.fn()
}));

vi.mock('node:fs/promises', () => ({
  readFile: readFileMock
}));

describe('loadMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse a valid metadata file correctly', async () => {
    const validMetadata = {
      variables: {
        '--color-primary': {
          name: '--color-primary',
          defaultValue: '#007bff',
          type: 'color',
          category: 'brand',
          tags: ['primary', 'brand'],
          description: 'Primary brand color'
        }
      }
    };
    readFileMock.mockResolvedValue(JSON.stringify(validMetadata));

    const result = await loadMetadata('/path/to/metadata.json');

    expect(result).toEqual(validMetadata);
    expect(result.variables['--color-primary'].name).toBe('--color-primary');
  });

  it('should throw when variables property is missing', async () => {
    readFileMock.mockResolvedValue(JSON.stringify({ notVariables: {} }));

    await expect(loadMetadata('/path/to/metadata.json')).rejects.toThrow('Invalid metadata shape');
  });

  it('should throw with descriptive message when file is missing', async () => {
    readFileMock.mockRejectedValue(new Error('ENOENT: no such file or directory'));

    await expect(loadMetadata('/missing/file.json')).rejects.toThrow(
      'Failed to read metadata file at "/missing/file.json"'
    );
  });

  it('should parse variables with all optional fields correctly', async () => {
    const fullMetadata = {
      variables: {
        '--color-primary': {
          name: '--color-primary',
          defaultValue: '#007bff',
          type: 'color',
          category: 'brand',
          tags: ['primary', 'brand'],
          description: 'Primary brand color',
          label: 'Primary Color',
          component: { library: '@my-lib', name: 'button' },
          references: [
            { name: '--color-base', defaultValue: '#000' }
          ]
        }
      }
    };
    readFileMock.mockResolvedValue(JSON.stringify(fullMetadata));

    const result = await loadMetadata('/path/to/metadata.json');

    expect(result.variables['--color-primary'].label).toBe('Primary Color');
    expect(result.variables['--color-primary'].component).toEqual({ library: '@my-lib', name: 'button' });
    expect(result.variables['--color-primary'].references).toHaveLength(1);
  });

  it('should parse variables with only required fields correctly', async () => {
    const minimalMetadata = {
      variables: {
        '--spacing-sm': {
          name: '--spacing-sm',
          defaultValue: '4px'
        }
      }
    };
    readFileMock.mockResolvedValue(JSON.stringify(minimalMetadata));

    const result = await loadMetadata('/path/to/metadata.json');

    expect(result.variables['--spacing-sm'].name).toBe('--spacing-sm');
    expect(result.variables['--spacing-sm'].defaultValue).toBe('4px');
    expect(result.variables['--spacing-sm'].type).toBeUndefined();
    expect(result.variables['--spacing-sm'].tags).toBeUndefined();
  });
});
