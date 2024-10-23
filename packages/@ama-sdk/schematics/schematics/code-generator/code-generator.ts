import {
  chain,
  SchematicContext,
  TaskConfiguration,
  TaskConfigurationGenerator,
  TaskExecutor,
  Tree
} from '@angular-devkit/schematics';
import {
  NodeModulesEngineHost
} from '@angular-devkit/schematics/tools';

/**
 * Common configuration for all the code generators
 */
export type CodegenTaskOptions = {
  /**
   * Path to the Swagger specification
   * @default 'swagger-spec.yaml'
   */
  specPath: string;
  /**
   * Path to the swagger configuration
   */
  specConfigPath: string;
  /**
   * Output path for the generated sdk
   */
  outputPath: string;
};

/**
 * Expose angular schematics to run any code generator.
 * Handle the task registration, configuration and the schematic's schedule.
 *
 * As is, the CodeGenerator does not implement any actual code generation and needs to be extended to be functional
 * @see {@link OpenApiCliGenerator}
 */
export abstract class CodeGenerator<T extends CodegenTaskOptions> {
  /**
   * Refers to the name the {@link Task} will be identified in a {@link Rule} ${@link SchematicContext}
   */
  protected abstract generatorName: string;

  /**
   * Configure the code generation task
   * Merge the generator's default options with the dynamic one provided by the schematics
   * @param options to override the generator's {@link getDefaultOptions}
   */
  private getTaskConfiguration(options: Partial<T>): TaskConfigurationGenerator<T> {
    const name = this.generatorName;
    const opts: T = { ...this.getDefaultOptions(), ...options };
    return new (class implements TaskConfigurationGenerator<T> {
      public toConfiguration(): TaskConfiguration<T> {
        return {
          name,
          options: opts
        };
      }
    })();
  }

  /**
   * Register the task in the rule's {@link SchematicContext}
   * @param factoryOptions execution options (root directory for instance)
   * @param factoryOptions.rootDirectory
   */
  private registerGeneratorExecutor(factoryOptions: { rootDirectory?: string }) {
    return (tree: Tree, context: SchematicContext) => {
      // workaround for issue https://github.com/angular/angular-cli/issues/12678
      // eslint-disable-next-line no-underscore-dangle -- accessing to a private field for the workaround
      const host = (context.engine as any)._host as NodeModulesEngineHost;
      host.registerTaskExecutor<T>({
        name: this.generatorName,
        create: () => Promise.resolve(this.runCodeGeneratorFactory(factoryOptions) as TaskExecutor)
      });

      return tree;
    };
  }

  /**
   * Returns the generator specific default options
   */
  protected abstract getDefaultOptions(): T;

  /**
   * Returns the schematic that will run the code generator
   * @param _factoryOptions execution options (root directory for instance)
   * @param _factoryOptions.rootDirectory
   */
  protected runCodeGeneratorFactory(_factoryOptions: { rootDirectory?: string } = {}): TaskExecutor<T> {
    return (_options?: T) => {
      return Promise.reject(new Error('No implementation, please target an implementation'));
    };
  }

  /**
   * Returns the schematic to register, configure and run your code generator task
   * @param generatorOptions to configure the generator and the specification file to use
   * @param factoryOptions to configure the generator execution context
   * @param factoryOptions.rootDirectory directory where all your commands will be run - fallback to process.cwd
   */
  public getGeneratorRunSchematic(generatorOptions: Partial<T>, factoryOptions: { rootDirectory?: string } = {}) {
    const scheduleTask = (tree: Tree, context: SchematicContext) => {
      context.addTask(this.getTaskConfiguration(generatorOptions));
      return tree;
    };
    return chain([
      this.registerGeneratorExecutor(factoryOptions),
      scheduleTask
    ]);
  }
}
