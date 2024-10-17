/* eslint-disable no-undef */
import { TransformOptions, transformSync } from 'esbuild';
import * as fs from 'node:fs';
import { Module } from 'node:module';
import { requireFromString } from 'module-from-string';
import * as path from 'node:path';
/**
 * Switch to the needed implementation of core testing, when running e2e tests
 * transforms ESM into CJS when needed
 * @param frameworkName Name of the framework used for e2e testing (playwright|protractor)
 * @param customTransformOptions
 */
export function adjustPath(frameworkName: 'playwright' | 'protractor', customTransformOptions: TransformOptions = {}) {
  const modulesCache: Record<string, any> = {};
  const originalRequire = Module.prototype.require;
  const regex = new RegExp(`@o3r/testing/core(?!/${frameworkName})(.*)`);
  Module.prototype.require = function (this: NodeJS.Module, id: string) {
    const newId = id.replace(regex, `@o3r/testing/core/${frameworkName}$1`);

    try {
      return Reflect.apply(originalRequire, this, [newId]);
    } catch {
      const paths = ([] as string[])
        .concat(this.paths, this.paths.map((i) => i.replace(/[\\/]node_modules$/, '')));

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
          modulesCache[filePath] = requireFromString(trans.code, {
            dirname: path.dirname(filePath),
            useCurrentGlobal: true
          });
        } catch (ex) {
          // eslint-disable-next-line no-console
          console.error(ex);
        }
      }

      return modulesCache[filePath];
    }

  } as NodeJS.Require;
}
