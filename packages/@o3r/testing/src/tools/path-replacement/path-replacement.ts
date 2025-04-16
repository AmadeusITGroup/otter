import * as fs from 'node:fs';
import {
  Module,
} from 'node:module';
import * as path from 'node:path';
import {
  TransformOptions,
  transformSync,
} from 'esbuild';
import {
  requireFromString,
} from 'module-from-string';

type ModuleType = 'ESM' | 'CJS' | 'unknown';

/**
 * Switch to the needed implementation of core testing, when running e2e tests
 * transforms ESM into CJS when needed
 * @param frameworkName Name of the framework used for e2e testing (playwright|protractor)
 * @param customTransformOptions
 */
export function adjustPath(frameworkName: 'playwright' | 'protractor', customTransformOptions: TransformOptions = {}) {
  const modulesCache: Record<string, any> = {};
  const moduleTypesCache: Record<string, ModuleType> = {};
  // eslint-disable-next-line @typescript-eslint/unbound-method -- No need to bind the method, we are using `apply`
  const originalRequire = Module.prototype.require;
  const regex = new RegExp(`@o3r/testing/core(?!/${frameworkName})(.*)`);
  Module.prototype.require = function (this: NodeJS.Module, id: string) {
    const newId = id.replace(regex, `@o3r/testing/core/${frameworkName}$1`);
    const paths = ([] as string[])
      .concat(this.paths, this.paths.map((i) => i.replace(/[/\\]node_modules$/, '')));

    const filePath = require.resolve(newId, { paths });

    const moduleType = checkModuleType(filePath, moduleTypesCache);
    if (moduleType === 'ESM') {
      return convertESMToCJS(newId, filePath, modulesCache, customTransformOptions);
    } else {
      try {
        return Reflect.apply(originalRequire, this, [newId]);
      } catch {
        return convertESMToCJS(newId, filePath, modulesCache, customTransformOptions);
      }
    }
  } as NodeJS.Require;
}

function convertESMToCJS(newId: string, filePath: string, modulesCache: Record<string, any>, customTransformOptions: TransformOptions = {}): any {
  if (!modulesCache[newId]) {
    const fileContent = fs.readFileSync(filePath);
    const cwd = path.resolve(process.cwd(), 'src');
    // we use ESBUILD to transform it into CJS
    const trans = transformSync(fileContent.toString(), {
      loader: 'js',
      format: 'cjs',
      target: 'es2016',
      sourcesContent: true,
      sourceRoot: cwd,
      ...customTransformOptions
    });

    /**
     * requireFromString will execute the file apart from just returning a module
     * It can throw an exception which will prevent stop the execution
     *
     * That main blocker includes IVY-compatible libraries which have
     * no compiler facade in a global scope.
     */
    try {
      modulesCache[newId] = requireFromString(trans.code, {
        dirname: path.dirname(filePath),
        useCurrentGlobal: true
      });
    } catch (ex) {
      // eslint-disable-next-line no-console -- no other logger available
      console.error(ex);
    }
  }

  return modulesCache[newId];
}

function checkModuleType(modulePath: string, cache: Record<string, ModuleType>): ModuleType {
  if (cache[modulePath]) {
    return cache[modulePath];
  }

  let type: ModuleType = 'unknown';
  const ext = path.extname(modulePath);
  switch (ext) {
    case '.mjs': {
      type = 'ESM';

      break;
    }
    case '.cjs': {
      type = 'CJS';

      break;
    }
    case '.js': {
    // Find recursively the package.json file to check if it is an ESM module
      const packageJsonPath = findPackageJson(modulePath);
      if (packageJsonPath !== null) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- Needed to require the package.json file
        const packageJson = require(packageJsonPath);
        type = packageJson.type === 'module' ? 'ESM' : 'CJS';
      }

      break;
    }
    default: {
      type = 'unknown';
    }
  }

  cache[modulePath] = type;
  return type;
}

function findPackageJson(filePath: string): string | null {
  const packageJsonPath = path.join(filePath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    return packageJsonPath;
  }
  const parentDir = path.dirname(filePath);
  if (parentDir === filePath) {
    return null;
  }
  return findPackageJson(parentDir);
}
