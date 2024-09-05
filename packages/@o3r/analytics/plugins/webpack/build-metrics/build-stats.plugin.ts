import * as os from 'node:os';
import {Compilation, Compiler, JavascriptModulesPlugin, NormalModule, Parser, WebpackPluginInstance } from 'webpack';
import type { ReportData, Reporter, Timing } from './reporters.interface';
import { randomUUID } from 'node:crypto';


/**
 * BuildStats Plugin Options
 */
export interface BuildStatsPluginOptions {
  /** The minimum time in milliseconds, for timing to be included in stats */
  threshold?: number;
  /** The name of the application */
  appName: string;
  /** The reporters to use */
  reporters: Reporter[];
  /** Session ID to identify the current run */
  sessionId: string;
}

const defaultOptions: BuildStatsPluginOptions = {
  threshold: 50,
  appName: 'Test',
  reporters: [ console ],
  sessionId: randomUUID()
};

const PLUGIN_NAME = 'OtterBuildStatsPlugin';

type AvailableHooks = 'resolver' | 'resolveOptions';

export class BuildStatsPlugin implements WebpackPluginInstance {
  private readonly options: BuildStatsPluginOptions;
  private timingData: Timing = {};
  private pluginDurations: { [key: string]: number } = {};
  private loaderDurations: { [key: string]: number } = {};

  constructor(options?: BuildStatsPluginOptions) {
    this.options = { ...defaultOptions, ...options };
    this.options.reporters.forEach((reporter) => reporter.debug?.(`Session ID: ${this.options.sessionId}`));
  }

  private bindCompilerCallbacks(compiler: Compiler) {
    Object.entries(compiler.hooks)
      .filter(([, hook]) => !!hook)
      .forEach(([hookName, hook]) => hook.intercept(this.makeInterceptorFor('Compiler')(hookName)));

    Object.entries(compiler.resolverFactory.hooks)
      .filter(([hookName]) => !!compiler.resolverFactory.hooks[hookName as AvailableHooks])
      .map(([hookName]) => [hookName, compiler.resolverFactory.hooks[hookName as AvailableHooks]])
      .forEach(([hookName, hook]) => typeof hook !== 'string' && hook.intercept(this.makeInterceptorFor('Compiler')(hookName as AvailableHooks) as any));

    compiler.hooks.compilation.tap(
      PLUGIN_NAME,
      (compilation, { normalModuleFactory, contextModuleFactory }) => {
        this.interceptAllHooksFor(compilation, 'Compilation');
        this.interceptAllHooksFor(
          normalModuleFactory,
          'Normal Module Factory'
        );
        this.interceptAllHooksFor(
          contextModuleFactory,
          'Context Module Factory'
        );
        this.interceptAllParserHooks(normalModuleFactory);
        this.interceptAllJavascriptModulesPluginHooks(compilation);
        compilation.hooks.buildModule.tap({ name: PLUGIN_NAME }, (module) => {
          const normalModule = module as unknown as NormalModule;
          if (normalModule.loaders?.length) {
            normalModule.loaders.forEach((loader) => {
              const name = this.getLoaderName(loader);
              performance.mark(`loader-${name}`);

            });
          }
        });
        compilation.hooks.succeedModule.tap({ name: PLUGIN_NAME }, (module) => {
          const normalModule = module as NormalModule;
          if (normalModule.loaders?.length) {
            normalModule.loaders.forEach((loader) => {
              const name = this.getLoaderName(loader);
              const duration = performance.measure(name, `loader-${name}`).duration;
              this.loaderDurations[name] = (this.loaderDurations[name] || 0) + duration;
              performance.clearMarks(`loader-${name}`);
              performance.clearMeasures(name);
            });
          }
        });
      }
    );
    compiler.hooks.watchRun.tap({ name: PLUGIN_NAME }, () => this.resetStats());
    compiler.hooks.afterDone.tap({ name: PLUGIN_NAME }, (stats) => {
      for (const key in this.loaderDurations) {
        if (Object.prototype.hasOwnProperty.call(this.loaderDurations, key)) {
          this.timingData[key] = [this.loaderDurations[key]];
        }
      }
      if (stats.compilation.endTime === undefined || stats.compilation.startTime === undefined) {
        return;
      }
      const buildData: ReportData = {
        compileTime: stats.compilation.endTime - stats.compilation.startTime,
        buildType: compiler.modifiedFiles?.size ? 'watch' : 'full',
        loadersAndCompilation: this.timingData,
        pluginTiming: this.filterTimingsForThreshold(),
        cpuStats: {
          coresData: os.cpus(),
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          percentageFree: (os.freemem() / os.totalmem()) * 100
        },
        hostName: os.hostname(),
        appName: this.options.appName,
        sessionId: this.options.sessionId
      };
      this.reportData(buildData);
    });
  }
  private interceptAllParserHooks(moduleFactory: any) {
    const moduleTypes = [
      'javascript/auto',
      'javascript/dynamic',
      'javascript/esm',
      'json',
      'webassembly/async',
      'webassembly/sync'
    ];

    moduleTypes.forEach(moduleType => {
      moduleFactory.hooks.parser
        .for(moduleType)
        .tap(PLUGIN_NAME, (parser: Parser, _parserOpts: any) => {
          this.interceptAllHooksFor(parser, 'Parser');
        });
    });
  }
  private interceptAllHooksFor(instance: any, logLabel: any) {
    if (Reflect.has(instance, 'hooks')) {
      Object.keys(instance.hooks).forEach(hookName => {
        const hook = instance.hooks[hookName];
        // eslint-disable-next-line no-underscore-dangle
        if (hook && !hook._fakeHook) {
          hook.intercept(this.makeInterceptorFor(logLabel)(hookName));
        }
      });
    }
  }

  private interceptAllJavascriptModulesPluginHooks(compilation: Compilation) {
    this.interceptAllHooksFor(
      {
        hooks:
          JavascriptModulesPlugin.getCompilationHooks(
            compilation
          )
      },
      'JavascriptModulesPlugin'
    );
  }

  private filterTimingsForThreshold(): { [key: string]: number } {
    const filtered: { [key: string]: number } = {};
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const limit = this.options.threshold ?? defaultOptions.threshold!;
    for (const key of Object.keys(this.pluginDurations)) {
      if (this.pluginDurations[key] > limit) {
        filtered[key] = this.pluginDurations[key];
      }
    }
    return filtered;
  }
  private resetStats() {
    performance.clearMeasures();
    performance.clearMarks();
    this.timingData = {};
    this.pluginDurations = {};
    this.loaderDurations = {};
  }


  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private makeNewProfiledTapFn(hook: string, { name, type, fn }: { name: string; type: string; fn: Function }) {

    switch (type) {
      case 'promise': {
        return (...args: any) => {
          this.recordPluginStart(name, hook);
          const promise = (fn(...args));
          return promise.then((_r: any) => {
            this.recordPluginEnd(name, hook);
          });
        };
      }
      case 'async': {
        return (...args: any) => {
          this.recordPluginStart(name, hook);
          const callback = args.pop();
          fn(...args, (...r: any[]) => {
            this.recordPluginEnd(name, hook);
            callback(...r);
          });
        };
      }
      case 'sync': {
        return (...args: any) => {

          if (name === PLUGIN_NAME) {
            return fn(...args);
          }
          this.recordPluginStart(name, hook);
          let r;
          try {
            r = fn(...args);
          } catch (error) {
            this.recordPluginEnd(name, hook);
            throw error;
          }
          this.recordPluginEnd(name, hook);
          return r;
        };
      }
      default: {
        return;
      }
    }
  }
  private readonly makeInterceptorFor = (_instance: string) => (hookName: string) => ({
    register: (tapInfo: any) => {
      const { name, type, fn } = tapInfo;
      const newFn =
        // Don't tap our own hooks to ensure stream can close cleanly
        name === PLUGIN_NAME
          ? fn
          : this.makeNewProfiledTapFn(hookName, {
            name,
            type,
            fn
          });
      return {
        ...tapInfo,
        fn: newFn
      };
    }
  });


  private recordPluginEnd(name: string, hook: string) {
    try {
      const duration = performance.measure(`${name}-${hook}`, `${name}-${hook}`).duration;
      this.pluginDurations[name] = (this.pluginDurations[name] || 0) + duration;
    } catch (e) {
      this.options.reporters.forEach((reporter) => reporter.error(e));
    }
    performance.clearMarks(`${name}-${hook}`);
    performance.clearMeasures(`${name}-${hook}`);
  }

  private recordPluginStart(name: string, hook: string) {
    performance.mark(`${name}-${hook}`);
  }

  private getLoaderName(loader: any): string {

    const actualLoader: string = loader.loader || loader;
    return actualLoader.replace(/\\/g, '/')
      .replace(
        /^.*\/node_modules\/(@[a-z0-9][\w-.]+\/[a-z0-9][\w-.]*|[^\\/]+).*$/,
        (_, m) => m
      );
  }

  private reportData(buildData: ReportData) {
    this.options.reporters.forEach((reporter) => {
      reporter.log(buildData);
    });
  }

  /** @inheritdoc */
  public apply(compiler: Compiler) {
    this.resetStats();
    this.bindCompilerCallbacks(compiler);
  }
}
