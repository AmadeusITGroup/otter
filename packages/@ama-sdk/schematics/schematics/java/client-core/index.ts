import {
  promises as fs
} from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
  SchematicContext,
  Tree
} from '@angular-devkit/schematics';
import {
  SwaggerJavaGenerator
} from '../../code-generator/swagger-java-generator/swagger-java.generator';
import {
  treeGlob
} from '../../helpers/tree-glob';
import {
  NgGenerateJavaClientCoreSchematicsSchema
} from './schema';

/** Base path where to find codegen jars */
const jarBasePath = path.resolve(__dirname, 'swagger-codegen-java-client', 'target');

/**
 * Generate a Java client SDK source code base on swagger specification
 * @param options
 */
function ngGenerateJavaClientCoreFn(options: NgGenerateJavaClientCoreSchematicsSchema): Rule {
  const specPath = path.resolve(process.cwd(), options.specPath);
  /**
   * rule to clear previous SDK generation
   * @param tree
   * @param context
   */
  const clearGeneratedCode = async (tree: Tree, context: SchematicContext) => {
    const swaggerConfig = options.specConfigPath ? JSON.parse(await fs.readFile(options.specConfigPath, { encoding: 'utf8' })) as Record<string, any> : undefined;
    if (swaggerConfig?.additionalProperties) {
      const modelPackage = swaggerConfig.additionalProperties?.basePackage;
      if (modelPackage) {
        context.logger.info('Remove previously generated base models');
        treeGlob(tree, path.join('src', 'main', 'java', ...modelPackage.split('.'), '**', '*.java')).forEach((file) => tree.delete(file));
      }

      const apiInterfacesPackage = swaggerConfig.additionalProperties.endpointsPackage;
      if (apiInterfacesPackage) {
        context.logger.info('Remove previously generated API interfaces');
        treeGlob(tree, path.join('src', 'main', 'java', ...apiInterfacesPackage.split('.'), '**', '*.java')).forEach((file) => tree.delete(file));
      }

      const apiImplPackage = swaggerConfig.additionalProperties.endpointsImplPackage;
      if (apiImplPackage) {
        context.logger.info('Remove previously generated API implementations');
        treeGlob(tree, path.join('src', 'main', 'java', ...apiImplPackage.split('.'), '**', '*.java')).forEach((file) => tree.delete(file));
      }
    }

    context.logger.info('Remove previously generated doc');
    treeGlob(tree, path.join('docs', '**')).forEach((file) => tree.delete(file));
    if (tree.exists('/README.md')) {
      context.logger.info('Remove previously generated readme');
      tree.delete('/README.md');
    }
    return () => tree;
  };

  /**
   * rule to update readme and generate mandatory code source
   * @param tree
   */
  const generateSource = async (tree: Tree) => {
    const specContent = await fs.readFile(path.resolve(process.cwd(), options.specPath), { encoding: 'utf8' });
    if (tree.exists('/swagger-spec.yaml')) {
      tree.overwrite('/swagger-spec.yaml', specContent);
    } else {
      tree.create('/swagger-spec.yaml', specContent);
    }

    return () => tree;
  };

  return chain([
    clearGeneratedCode,
    generateSource,
    (new SwaggerJavaGenerator()).getGeneratorRunSchematic({
      targetFolder: jarBasePath,
      specPath,
      codegenLanguage: 'javaClient',
      apiTests: false,
      specConfigPath: options.specConfigPath || undefined
    })
  ]);
}

/**
 * Generate a Java client SDK source code base on swagger specification
 * @param options
 */
export const ngGenerateJavaClientCore = (options: NgGenerateJavaClientCoreSchematicsSchema) => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngGenerateJavaClientCoreFn)(options);
};
