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
  const cjsModulesCache: Record<string, any> = {};
  const moduleTypesCache: Record<string, ModuleType> = {};
  // eslint-disable-next-line @typescript-eslint/unbound-method -- No need to bind the method, we are using `apply`
  const originalRequire = Module.prototype.require;
  const originalResolve = require.resolve;
  const regex = new RegExp(`@o3r/testing/core(?!/${frameworkName})(.*)`);
  Module.prototype.require = function (this: NodeJS.Module, id: string) {
    const newId = id.replace(regex, `@o3r/testing/core/${frameworkName}$1`);
    const paths = [
      ...this.paths,
      ...this.paths.map((i) => i.replace(/[/\\]node_modules$/, ''))
    ];

    const filePath = originalResolve(newId, { paths });

    const moduleType = checkModuleType(filePath, moduleTypesCache, originalRequire, originalResolve);
    if (moduleType === 'ESM') {
      return convertESMToCJS(newId, filePath, cjsModulesCache, customTransformOptions);
    }

    return Reflect.apply(originalRequire, this, [newId]);
  } as NodeJS.Require;
}

/**
 * Convert ESM to CJS using esbuild
 * @param moduleId
 * @param filePath
 * @param cjsModulesCache
 * @param customTransformOptions
 */
function convertESMToCJS(moduleId: string, filePath: string, cjsModulesCache: Record<string, any>, customTransformOptions: TransformOptions = {}): any {
  if (!cjsModulesCache[moduleId]) {
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

    /*
     * requireFromString will execute the file apart from just returning a module
     * It can throw an exception which will prevent stop the execution
     *
     * That main blocker includes IVY-compatible libraries which have
     * no compiler facade in a global scope.
     */
    try {
      cjsModulesCache[moduleId] = requireFromString(trans.code, {
        dirname: path.dirname(filePath),
        useCurrentGlobal: true
      });
    } catch (ex) {
      // eslint-disable-next-line no-console -- no other logger available
      console.error(ex);
    }
  }

  return cjsModulesCache[moduleId];
}

/**
 * Check the module type of the given module path.
 * @param modulePath
 * @param cache
 * @param originalRequire
 * @param originalResolve
 */
function checkModuleType(modulePath: string, cache: Record<string, ModuleType>, originalRequire: (id: string) => any, originalResolve: NodeJS.RequireResolve): ModuleType {
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
      const packageJsonPath = findPackageJson(modulePath, originalResolve);
      if (packageJsonPath !== null) {
        const packageJson = originalRequire(packageJsonPath);
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

/**
 * Returns the path to the package.json file in the directory path given as argument.
 * The method is called recursively to find the package.json in the parent directories.
 * @param dirPath
 * @param originalResolve
 */
function findPackageJson(dirPath: string, originalResolve: NodeJS.RequireResolve): string | null {
  const packageJsonPath = path.join(dirPath, 'package.json');
  const packageJsonExists = (() => {
    try {
      originalResolve(packageJsonPath);
      return true;
    } catch {
      return false;
    }
  })();

  if (packageJsonExists) {
    return packageJsonPath;
  }

  const parentDir = path.dirname(dirPath);
  if (parentDir === dirPath) {
    return null;
  }
  return findPackageJson(parentDir, originalResolve);
}
