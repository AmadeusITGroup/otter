import {
  exec,
  type ExecException,
} from 'node:child_process';
import {
  promises as fs,
} from 'node:fs';
import {
  createRequire,
} from 'node:module';
import {
  dirname,
  posix,
} from 'node:path';
import {
  globby,
} from 'globby';
import {
  OPENAPI_NPM_KEYWORDS,
} from '../constants.mjs';
import type {
  Context,
} from '../context.mjs';
import {
  type ListDependenciesOptions,
  listSpecificationArtifacts,
} from './list-artifacts.mjs';

jest.mock('node:child_process', () => ({
  exec: jest.fn()
}));

jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

jest.mock('node:module', () => ({
  createRequire: jest.fn()
}));

jest.mock('globby', () => ({
  globby: jest.fn()
}));

jest.mock('../constants.mjs', () => ({
  OPENAPI_NPM_KEYWORDS: ['openapi', 'ama-openapi']
}));

const execMock = exec as jest.MockedFunction<typeof exec>;
const readFileMock = fs.readFile as jest.MockedFunction<typeof fs.readFile>;
const createRequireMock = createRequire as jest.MockedFunction<typeof createRequire>;
const globbyMock = globby as jest.MockedFunction<typeof globby>;

const createCtx = (
  overrides: Partial<ListDependenciesOptions & Context> = {}
): ListDependenciesOptions & Context => ({
  cwd: '/proj',
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  } as any,
  ...overrides
} as any);

describe('listSpecificationArtifacts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lists artifacts whose package.json keywords match OPENAPI_NPM_KEYWORDS', async () => {
    const options = createCtx();

    // npm ls output
    (execMock as any).mockImplementation((cmd: string, cb: (err: any, res: { stdout: string }) => void) => {
      expect(cmd).toBe('npm ls -a --json --include prod --depth=0');
      cb(null, {
        stdout: JSON.stringify({
          dependencies: {
            'pkg-openapi': {},
            'pkg-other': {}
          }
        })
      });
    });

    // createRequire + require.resolve
    const fakeRequire = ((p: string) => {
      // only used by implementation via require.resolve
      return `/node_modules/${p}`;
    }) as any;
    fakeRequire.resolve = (p: string) => {
      if (p === posix.join('pkg-openapi', 'package.json')) {
        return `/node_modules/pkg-openapi/package.json`;
      }
      if (p === posix.join('pkg-other', 'package.json')) {
        return `/node_modules/pkg-other/package.json`;
      }
      // model resolution
      return `/resolved/${p}`;
    };
    createRequireMock.mockReturnValue(fakeRequire);

    // package.json contents
    readFileMock.mockImplementation((filePath: any) => {
      if (filePath.includes('pkg-openapi')) {
        return Promise.resolve(JSON.stringify({
          name: 'pkg-openapi',
          keywords: ['lib', 'openapi']
        }));
      }
      if (filePath.includes('pkg-other')) {
        return Promise.resolve(JSON.stringify({
          name: 'pkg-other',
          keywords: ['lib']
        }));
      }
      throw new Error('Unexpected filePath ' + filePath);
    });

    // globby for models
    globbyMock.mockResolvedValueOnce(['models/a.json', 'models/b.yaml']);

    const artifacts = await listSpecificationArtifacts(options);

    // only pkg-openapi should be kept
    expect(artifacts).toHaveLength(1);
    const artifact = artifacts[0] as any;

    expect(artifact.packageManifest.name).toBe('pkg-openapi');
    expect(artifact.baseDirectory).toBe(
      dirname('/node_modules/pkg-openapi/package.json')
    );

    expect(globbyMock).toHaveBeenCalledWith('**/*.{json,yaml,yml}', {
      cwd: artifact.baseDirectory,
      ignore: ['package.json']
    });

    // models mapped with model + resolved path
    expect(artifact.models).toEqual([
      {
        model: 'models/a.json',
        modelPath: expect.stringContaining('pkg-openapi')
      },
      {
        model: 'models/b.yaml',
        modelPath: expect.stringContaining('pkg-openapi')
      }
    ]);
  });

  it('uses ignoreFiles option and skips packages whose package.json cannot be resolved', async () => {
    const logger = {
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn()
    } as any;
    const options = createCtx({
      logger,
      ignoreFiles: ['package.json', 'ignored.yaml']
    });

    (execMock as any).mockImplementation((cmd: string, cb: (err: any, res: { stdout: string }) => void) => {
      cb(null, {
        stdout: JSON.stringify({
          dependencies: {
            'pkg-ok': {},
            'pkg-bad': {}
          }
        })
      });
    });

    const fakeRequire = ((p: string) => `/node_modules/${p}`) as any;
    fakeRequire.resolve = (p: string) => {
      if (p === posix.join('pkg-ok', 'package.json')) {
        return `/node_modules/pkg-ok/package.json`;
      }
      if (p === posix.join('pkg-bad', 'package.json')) {
        throw new Error('cannot resolve pkg-bad');
      }
      return `/resolved/${p}`;
    };
    createRequireMock.mockReturnValue(fakeRequire);

    readFileMock.mockResolvedValueOnce(
      JSON.stringify({
        name: 'pkg-ok',
        keywords: OPENAPI_NPM_KEYWORDS
      })
    );

    globbyMock.mockResolvedValueOnce(['models/model.json']);

    const artifacts = await listSpecificationArtifacts(options);

    // pkg-bad is skipped with a warning
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Error accessing pkg-bad/package.json')
    );
    expect(artifacts).toHaveLength(1);

    expect(globbyMock).toHaveBeenCalledWith('**/*.{json,yaml,yml}', {
      cwd: dirname('/node_modules/pkg-ok/package.json'),
      ignore: ['package.json', 'ignored.yaml']
    });
  });

  it('rethrows npm ls error when no stdout is available', async () => {
    const options = createCtx();

    const err: Partial<ExecException> = new Error('npm ls failed') as any;
    // no stdout field
    (execMock as any).mockImplementation((_cmd: string, cb: (err: any, res?: any) => void) => {
      cb(err, undefined as any);
    });

    await expect(listSpecificationArtifacts(options)).rejects.toBe(err);
    expect(options.logger.warn).toHaveBeenCalledWith('Error in "npm ls" run');
  });
});
