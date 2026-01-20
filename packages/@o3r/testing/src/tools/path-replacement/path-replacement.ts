import * as fs from 'node:fs';
import {
  createRequire,
  Module,
} from 'node:module';
import * as path from 'node:path';
import {
  createContext,
  Script,
} from 'node:vm';
import {
  TransformOptions,
  transformSync,
} from 'esbuild';

/**
 * Get the global variables of the current process
 * @returns The global variables of the current process
 */
function getNodeGlobals(): Record<string, unknown> {
  const globals: Record<string, unknown> = Object.create(null);

  for (const key of Object.getOwnPropertyNames(globalThis)) {
    try {
      const value = (globalThis as Record<string, unknown>)[key];
      try {
        globals[key] = structuredClone(value);
      } catch {
        // Non-cloneable values (functions, symbols, etc.) - use reference
        globals[key] = value;
      }
    } catch {
      // Some properties may throw when accessed (e.g., deprecated ones)
    }
  }

  globals.global = globalThis;
  globals.globalThis = globalThis;

  return globals;
}

/**
 * Load a CommonJS module from a string.
 * @param code The module code to execute
 * @param dirname The directory to use as the module's dirname
 */
function requireFromString(code: string, dirname: string): string {
  const filename = path.join(dirname, '_virtual.js');
  const mainRequire = require.main;
  const tempModule = new Module(filename, mainRequire);
  tempModule.require = createRequire(filename);
  tempModule.filename = filename;
  tempModule.paths = mainRequire?.paths ?? [];
  const context = createContext({
    ...getNodeGlobals(),
    module: tempModule,
    exports: tempModule.exports,
    require: tempModule.require.bind(tempModule),
    __dirname: dirname,
    __filename: filename
  });

  const script = new Script(code, {
    filename
  });
  script.runInContext(context);
  tempModule.loaded = true;
  return tempModule.exports;
}

/**
 * Switch to the needed implementation of core testing, when running e2e tests
 * transforms ESM into CJS when needed
 * @param frameworkName Name of the framework used for e2e testing (playwright)
 * @param customTransformOptions
 */
export function adjustPath(frameworkName: 'playwright' = 'playwright', customTransformOptions: TransformOptions = {}) {
  const modulesCache: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/unbound-method -- No need to bind the method, we are using `apply`
  const originalRequire = Module.prototype.require;
  const regex = new RegExp(`@o3r/testing/core(?!/${frameworkName})(.*)`);
  Module.prototype.require = function (this: NodeJS.Module, id: string) {
    const newId = id.replace(regex, `@o3r/testing/core/${frameworkName}$1`);

    try {
      return Reflect.apply(originalRequire, this, [newId]);
    } catch {
      const paths = ([] as string[])
        .concat(this.paths, this.paths.map((i) => i.replace(/[/\\]node_modules$/, '')));

      const filePath = require.resolve(newId, { paths });
      if (!modulesCache[filePath]) {
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
          modulesCache[filePath] = requireFromString(trans.code, path.dirname(filePath));
        } catch (ex) {
          // eslint-disable-next-line no-console -- no other logger available
          console.error(ex);
        }
      }

      return modulesCache[filePath];
    }
  } as NodeJS.Require;
}
