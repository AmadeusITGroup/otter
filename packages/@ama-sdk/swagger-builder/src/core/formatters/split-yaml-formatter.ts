import fs from 'node:fs';
import yaml from 'js-yaml';
import path from 'node:path';
import { Formatter } from './formatter.interface';
import { generatePackageJson } from './utils';

/**
 * Formatter to generate split Swagger spec in YAML files
 */
export class SplitYamlFormatter implements Formatter {

  /** Definitions folder */
  public readonly DEFINITIONS_FOLDER = 'definitions';

  /** Products folder */
  public readonly PRODUCTS_FOLDER = 'products';

  /** Parameters file */
  public readonly PARAMETERS_FILE = 'parameters';

  private readonly filePath: string;
  private readonly cwd: string;

  constructor(private readonly basePath: string) {
    this.filePath = /\.json$/i.test(this.basePath) ? this.basePath : this.basePath + '.json';
    this.cwd = path.dirname(this.filePath);
  }

  /**
   * Write a YAML file
   * @param filePath Path to the file to write
   * @param content Content of the file to write
   */
  private async writeFileYaml(filePath: string, content: any) {
    await fs.promises.mkdir(path.dirname(filePath), {recursive: true});
    await fs.promises.writeFile(filePath, yaml.dump(content, { indent: 2 }));
  }

  /**
   * Write a JSON file
   * @param filePath Path to the file to write
   * @param content Content of the file to write
   */
  private async writeFileJson(filePath: string, content: any) {
    await fs.promises.mkdir(path.dirname(filePath), {recursive: true});
    await fs.promises.writeFile(filePath, JSON.stringify(content, null, 2));
  }

  private async rewriterReferences(currentNode: any, field?: string): Promise<any> {
    if (currentNode === undefined || currentNode === null) {
      return currentNode;
    } else if (field === '$ref') {
      const [refType, refPath] = currentNode.replace(/^#\//, '').split('/') as string[];
      if (refType === 'parameters') {
        return `../${refType}.yaml#/${refType}/${refPath}`;
      } else {
        return `../${refType}/${refPath}.yaml#/${refType}/${refPath}`;
      }
    } else if (Array.isArray(currentNode)) {
      return await Promise.all(
        currentNode.map((n) => this.rewriterReferences(n))
      );
    } else if (typeof currentNode === 'object') {
      const ret: Record<string, any> = {};
      for (const k of Object.keys(currentNode)) {
        ret[k] = await this.rewriterReferences(currentNode[k], k);
      }
      return ret;
    }
    return currentNode;
  }

  /**
   * Generate the definition files based on the given Swagger spec
   * @param spec Swagger specification
   */
  private async generateDefinitionFiles(spec: any) {
    await Promise.all(
      Object.keys(spec.definitions)
        .map((defName) => this.writeFileYaml(path.resolve(this.cwd, this.DEFINITIONS_FOLDER, `${defName}.yaml`), {
          swagger: '2.0',
          info: {
            version: spec.info.version,
            title: defName,
            description: `Definition for the DAPI model ${defName}`
          },
          definitions: {
            [defName]: spec.definitions[defName]
          }
        }))
    );
  }

  /**
   * Generate the definition files based on the given Swagger specification
   * @param spec Swagger specification
   */
  private generateParameterFile(spec: any) {
    return this.writeFileYaml(path.resolve(this.cwd, `${this.PARAMETERS_FILE}.yaml`), {
      swagger: '2.0',
      info: {
        version: spec.info.version,
        title: 'Parameters',
        description: 'All the parameters used in APIs'
      },
      parameters: spec.parameters
    });
  }

  /**
   * Generate the product files based on the given Swagger specification
   * @param spec Swagger specification
   */
  private async generateProductFiles(spec: any): Promise<string[]> {
    const pathNames = Object.keys(spec.paths);
    const products = pathNames
      .map((p) => p.replace(/^\//, '').split('/')[0])
      .reduce<string[]>((acc, p) => {
        if (acc.indexOf(p) < 0) {
          acc.push(p);
        }
        return acc;
      }, []);

    await Promise.all(
      products
        .map((product) => {
          const paths = pathNames.reduce<Record<string, any>>((acc, p) => {
            if (new RegExp(`^[/]?${product}`).test(p)) {
              acc[p] = spec.paths[p];
            }
            return acc;
          }, {});
          return this.writeFileYaml(path.resolve(this.cwd, this.PRODUCTS_FOLDER, `${product} API.yaml`), {
            swagger: '2.0',
            info: {
              version: spec.info.version,
              title: 'Parameters',
              description: 'All the parameters used in APIs'
            },
            tags: (spec.tags as {name: string}[])
              .filter((tag) => Object.keys(paths)
                .some((k) => Object.keys(paths[k])
                  .some((pathType) => (paths[k][pathType].tags || []).indexOf(tag.name) >= 0))
              ),
            paths
          });
        })
    );

    return products;
  }

  /**
   * Generate the template file based on the given Swagger specification
   * @param spec Swagger specification
   */
  private generateEnvelop(spec: any) {
    return this.writeFileYaml(path.resolve(this.cwd, path.basename(this.filePath, '.json') + '.yaml'),
      Object.keys(spec)
        .filter((k) => ['tags', 'parameters', 'paths', 'definitions'].indexOf(k.toLowerCase()) < 0)
        .reduce<{ [k: string]: any }>((acc, k) => {
          acc[k] = spec[k];
          return acc;
        }, {})
    );
  }

  /**
   * Generate the API description JSON file based on the list of products of the Swagger specification
   * @param products List of product of the Swagger spec
   */
  private generateJsonFile(products: string[]) {
    return this.writeFileJson(this.filePath, {
      $schema: path.relative(this.cwd, path.resolve(__dirname, '..', '..', 'schemas', 'api-configuration.schema.json')).replace(/[\\/]/g, '/'),
      swaggerTemplate: `./${path.basename(this.filePath, '.json')}.yaml`,
      products: products.map((product) => `${product} API`)
    });
  }

  /** @inheritdoc */
  public async generate(spec: any): Promise<void> {
    const writableSpec = await this.rewriterReferences({...spec});
    await this.generateEnvelop(writableSpec);
    await this.generateDefinitionFiles(writableSpec);
    await this.generateParameterFile(writableSpec);
    const products = await this.generateProductFiles(writableSpec);
    await this.generateJsonFile(products);
    // eslint-disable-next-line no-console
    console.info(`Spec generated to ${this.filePath}`);
  }

  /** @inheritdoc */
  public async generateArtifact(artifactName: string, spec: any): Promise<void> {
    await fs.promises.mkdir(this.cwd, {recursive: true});

    const content = JSON.stringify({
      ...generatePackageJson(artifactName, spec),
      main: path.relative(this.cwd, this.filePath),
      exports: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        './openapi.yaml': {
          default: path.relative(this.cwd, this.filePath)
        }
      }
    }, null, 2);

    await fs.promises.writeFile(path.resolve(this.cwd, 'package.json'), content);
    // eslint-disable-next-line no-console
    console.info(`Artifact generated for ${this.filePath}`);
  }
}
