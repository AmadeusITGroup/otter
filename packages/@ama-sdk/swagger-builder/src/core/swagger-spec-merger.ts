import path from 'node:path';
import process from 'node:process';
import type {
  Path,
  Spec,
} from 'swagger-schema-official';
import {
  SwaggerSpec,
} from './swagger-spec-wrappers/swagger-spec.interface';
import {
  isOuterRefPath,
  isUrlRefPath,
} from './swagger-spec-wrappers/utils';
import {
  addDefinitionToSpecObj,
  addParameterToSpecObj,
  addResponseToSpecObj,
  addTagToSpecObj,
  getTargetInformation,
} from './utils';

/**
 * Option to the build process
 */
export interface BuildOptions {
  /** @see BuilderOptions.setVersion */
  setVersion?: string;

  /** @see BuilderOptions.ignoreConflict */
  ignoreConflict?: boolean;
}

type OverrideItems = { definitions: string[]; parameters: string[]; paths: { url: string; method: string }[]; responses: string[]; tags: string[] };

/**
 * Tool to merge several Swagger Spec (YAML or Split Spec)
 */
export class SwaggerSpecMerger {
  /** List of references to items from another file  */
  private outerReferences: { swaggerPath: string; innerPath: string }[] = [];

  /** List of items override during the merge process */
  private overrideItems: OverrideItems = {
    definitions: [],
    parameters: [],
    paths: [],
    responses: [],
    tags: []
  };

  /** List of references already resolved during the build process */
  private alreadyResolvedList: { swaggerPath: string; innerPath: string; newPath: string }[] = [];

  /** List of additional spec required to consolidate the spec merged */
  public additionalSpecs: { [path: string]: SwaggerSpec } = {};

  constructor(public specs: SwaggerSpec[], public ignoredSwaggerPath: string[] = []) {}

  /**
   * Reset the temporary field before generating the final Swagger Spec
   */
  private async reset() {
    this.outerReferences = [];
    this.alreadyResolvedList = [];
    this.overrideItems = { definitions: [], parameters: [], paths: [], responses: [], tags: [] };
    const ignoredSpecs = [...this.ignoredSwaggerPath, ...this.specs.map((s) => s.sourcePath)];
    for (const spec of this.specs) {
      await spec.parse(ignoredSpecs);
    }
  }

  /**
   * Edit the Swagger Spec during the build process to resolve external dependencies
   * @param swaggerSpec Swagger spec to edit
   * @param swaggerPath Path to the swagger targeted by the reference
   * @param innerPath Inner path of the reference inside the targeted swagger spec
   */
  private async editSpecWithReferences(swaggerSpec: Partial<Spec>, swaggerPath: string, innerPath: string) {
    const originalSpec = this.specs.find((spec) => spec.sourcePath === swaggerPath);
    const [resourceType, resourcePath] = innerPath.replace(/^\//, '').split('/') as [keyof OverrideItems, any];
    const isOverride = originalSpec && this.overrideItems[resourceType] && this.overrideItems[resourceType].includes(resourcePath);
    let newPath = innerPath;

    const additionalSpec = isOverride ? originalSpec : this.additionalSpecs[swaggerPath];
    const alreadyResolved = this.alreadyResolvedList.find((a) => a.innerPath === innerPath && a.swaggerPath === swaggerPath);
    const shouldReferAgain = isOverride && !!alreadyResolved && alreadyResolved.newPath === innerPath;

    if (additionalSpec && (!alreadyResolved || shouldReferAgain)) {
      switch (resourceType) {
        case 'tags': {
          const tags = await additionalSpec.getTags();
          const tag = tags.find((t) => t.name === resourcePath);
          swaggerSpec = addTagToSpecObj(swaggerSpec, tag);
          break;
        }

        case 'definitions': {
          const definitions = await additionalSpec.getDefinitions();
          let definition = definitions[resourcePath];
          if (!originalSpec) {
            definition = await this.convertLocalRefToOuterRef(definition, swaggerPath);
          }
          const res = addDefinitionToSpecObj(swaggerSpec, resourcePath, definition, swaggerPath);
          swaggerSpec = res.swaggerSpec;
          newPath = `/${resourceType}/${res.finalName}`;
          break;
        }

        case 'responses': {
          const responses = await additionalSpec.getResponses();
          let response = responses[resourcePath];
          if (!originalSpec) {
            response = await this.convertLocalRefToOuterRef(response, swaggerPath);
          }
          const res = addResponseToSpecObj(swaggerSpec, resourcePath, response, swaggerPath);
          swaggerSpec = res.swaggerSpec;
          newPath = `/${resourceType}/${res.finalName}`;
          break;
        }

        case 'parameters': {
          const parameters = await additionalSpec.getParameters();
          let parameter = parameters[resourcePath];
          if (!originalSpec) {
            parameter = await this.convertLocalRefToOuterRef(parameter, swaggerPath);
          }
          const res = addParameterToSpecObj(swaggerSpec, resourcePath, parameter, swaggerPath);
          swaggerSpec = res.swaggerSpec;
          newPath = `/${resourceType}/${res.finalName}`;
          break;
        }

        default: {
          throw new Error(`${resourceType} targeting is not supported`);
        }
      }
    }

    const replacement = alreadyResolved || { swaggerPath, innerPath, newPath };
    if (!alreadyResolved) {
      this.alreadyResolvedList.push(replacement);
    }
    return this.replaceOuterRef(swaggerSpec, replacement);
  }

  /**
   * Convert the local references to outer references for a additional swagger spec (not part of the merge)
   * @param currentNode Node to inspect in the Swagger spec object
   * @param swaggerPath Swagger file path
   * @param field Field of the node
   */
  private async convertLocalRefToOuterRef(currentNode: any, swaggerPath: string, field?: string): Promise<any> {
    if (currentNode === undefined || currentNode === null) {
      return currentNode;
    } else if (field === '$ref') {
      if (!isOuterRefPath(currentNode)) {
        return swaggerPath + (currentNode as string);
      }
    } else if (Array.isArray(currentNode)) {
      return await Promise.all(
        currentNode.map((n) => this.convertLocalRefToOuterRef(n, swaggerPath))
      );
    } else if (typeof currentNode === 'object') {
      const res: Record<string, unknown> = {};
      for (const k of Object.keys(currentNode)) {
        res[k] = await this.convertLocalRefToOuterRef(currentNode[k], swaggerPath, k);
      }
      return res;
    }
    return currentNode;
  }

  /**
   * Resolve the reference found during the build process
   * @param swaggerSpec Swagger spec to edit
   */
  private async applyExternalRefItems(swaggerSpec: Partial<Spec>): Promise<Partial<Spec>> {
    const outerReferences = this.outerReferences
      // remove duplicate
      .reduce<{ swaggerPath: string; innerPath: string }[]>((acc, { swaggerPath, innerPath }) => {
        if (!acc.some((item) => item.innerPath === innerPath && item.swaggerPath === swaggerPath)) {
          acc.push({ swaggerPath, innerPath });
        }
        return acc;
      }, []);

    let ret = swaggerSpec;
    for (const ref of outerReferences) {
      ret = await this.editSpecWithReferences(ret, ref.swaggerPath, ref.innerPath);
    }
    return ret;
  }

  /**
   * Extract references targeting another file
   * @param currentNode Node to inspect in the Swagger spec object
   * @param field Field of the node
   */
  private async extractOuterRef(currentNode: any, field?: string): Promise<void> {
    if (currentNode === undefined || currentNode === null) {
      return;
    } else if (field === '$ref') {
      if (isOuterRefPath(currentNode)) {
        // eslint-disable-next-line prefer-const -- innerPath is not a const
        let [swaggerPath, innerPath] = currentNode.split('#');
        if (!this.ignoredSwaggerPath.includes(swaggerPath)) {
          if (!this.additionalSpecs[swaggerPath] && !this.specs.some((s) => s.sourcePath === swaggerPath)) {
            this.additionalSpecs[swaggerPath] = await getTargetInformation(isUrlRefPath(swaggerPath) ? swaggerPath : path.relative(process.cwd(), swaggerPath));
          }
          if (isUrlRefPath(swaggerPath) && !innerPath) {
            innerPath = `definitions/${Object.keys(await this.additionalSpecs[swaggerPath].getDefinitions())[0]}`;
          }
          if (!this.outerReferences.some((outerRef) => outerRef.innerPath === innerPath && outerRef.swaggerPath === swaggerPath)) {
            this.outerReferences.push({ innerPath, swaggerPath });
          }
        }
      }
    } else if (Array.isArray(currentNode)) {
      await Promise.all(
        currentNode.map((n) => this.extractOuterRef(n))
      );
    } else if (typeof currentNode === 'object') {
      for (const k of Object.keys(currentNode)) {
        await this.extractOuterRef(currentNode[k], k);
      }
    }
  }

  /**
   * Replace the reference targeting an external item by the one added into the current Swagger Spec object
   * @param currentNode Node to inspect in the Swagger spec object
   * @param replace Reference to replace
   * @param replace.swaggerPath
   * @param replace.innerPath
   * @param replace.newPath
   * @param field Field of the node
   */
  private async replaceOuterRef(currentNode: any, replace: { swaggerPath: string; innerPath: string; newPath: string }, field?: string): Promise<any> {
    if (currentNode === undefined) {
      return;
    } else if (currentNode === null) {
      return null;
    } else if (field === '$ref') {
      const [swaggerPath, innerPath] = currentNode.split('#');
      if (isOuterRefPath(currentNode) && swaggerPath === replace.swaggerPath && (innerPath === replace.innerPath || !innerPath)) {
        return '#' + replace.newPath;
      }
      return currentNode;
    } else if (Array.isArray(currentNode)) {
      return Promise.all(
        currentNode.map((n) => this.replaceOuterRef(n, replace))
      );
    } else if (typeof currentNode === 'object') {
      const ret: Record<string, unknown> = {};
      for (const k of Object.keys(currentNode)) {
        ret[k] = await this.replaceOuterRef(currentNode[k], replace, k);
      }
      return ret;
    }
    return currentNode;
  }

  /**
   * Build the envelop part of the swagger object
   */
  private async buildEnvelop() {
    const envelops = await Promise.all(this.specs.map((s) => s.getEnvelop()));
    return envelops
      .reduce<Record<string, unknown>>((acc, e) => {
        const info = { ...acc.info as (Record<string, unknown> | undefined), ...e.info };
        acc = {
          ...acc,
          ...e,
          info
        };
        return acc;
      }, {});
  }

  /**
   * Build the tag part of the swagger object
   */
  private async buildTags() {
    const tagsList = await Promise.all(this.specs.map((s) => s.getTags()));
    return tagsList.reduce<any[]>((acc, tags) => {
      tags
        .forEach((tag) => {
          const idx = acc.findIndex((t) => t.name === tag.name);
          if (idx === -1) {
            acc.push(tag);
          } else {
            Object.assign(acc[idx], tag);
          }
        });
      return acc;
    }, []);
  }

  /**
   * Build the parameters part of the swagger object
   */
  private async buildParameters() {
    const parameters = await Promise.all(this.specs.map((s) => s.getParameters()));
    return parameters
      .filter((e) => !!e)
      .reduce<{ [k: string]: any }>((acc, e) => {
        const props = Object.keys(acc);
        this.overrideItems.parameters.push(
          ...Object.keys(e).filter((param) => props.includes(param))
        );
        Object.assign(acc, e);
        return acc;
      }, {});
  }

  /**
   * Build the paths part of the swagger object
   * @param ignoreConflict Option to ignore conflict during the merge
   */
  private async buildPaths(ignoreConflict = false) {
    const paths = await Promise.all(this.specs.map((s) => s.getPaths()));
    return paths
      .filter((e) => !!e)
      .reduce<{ [k: string]: { [i in keyof Path]: any } }>((acc, e) => {
        const props = Object.keys(acc);
        const conflicts = Object.keys(e)
          .filter((url) =>
            props.includes(url)
            && Object.keys(acc[url]).some((method) => Object.keys(e[url]).includes(method))
          );
        const conflictMethods = conflicts.reduce<{ [url: string]: string[] }>((accConflict, url) => {
          accConflict[url] = Object.keys(acc[url]).filter((method) => !!e[url][method as keyof Path]);
          return accConflict;
        }, {});
        this.overrideItems.paths.push(
          ...Object.keys(conflictMethods).reduce<{ url: string; method: string }[]>((a, url) => {
            a.push(...conflictMethods[url].map((method) => ({ url, method })));
            return a;
          }, [])
        );
        if (conflicts.length > 0) {
          if (ignoreConflict) {
            Object.keys(conflictMethods)
              // eslint-disable-next-line no-console -- no logger available
              .forEach((url) => console.log(`The Path "${url}" will override the default method${conflictMethods[url].length > 1 ? 's' : ''} ${conflictMethods[url].join(', ')}`));
          } else {
            throw new Error(`The path${conflicts.length > 1 ? 's' : ''} ${Object.keys(conflictMethods)
              .map((url) => `${url} (${conflictMethods[url].join(', ')})`)
              .join(', ')} ${conflicts.length > 1 ? 'are' : 'is'} conflicting`);
          }
        }

        const mergedProps = Object.keys(e)
          .reduce<typeof e>((accProp, url) => {
            accProp[url] = acc[url] ? { ...acc[url], ...e[url] } : e[url];
            return accProp;
          }, {});

        return { ...acc, ...mergedProps };
      }, {});
  }

  /**
   * Build the definitions part of the swagger object
   */
  private async buildDefinitions() {
    const definitions = await Promise.all(this.specs.map((s) => s.getDefinitions()));
    return definitions
      .filter((e) => !!e)
      .reduce<{ [k: string]: any }>((acc, e) => {
        const props = Object.keys(acc);
        this.overrideItems.definitions.push(
          ...Object.keys(e).filter((param) => props.includes(param))
        );
        Object.assign(acc, e);
        return acc;
      }, {});
  }

  /**
   * Build the responses part of the swagger object
   */
  private async buildResponses() {
    const responses = await Promise.all(this.specs.map((s) => s.getResponses()));
    return responses
      .filter((e) => !!e)
      .reduce<{ [k: string]: any }>((acc, e) => {
        const props = Object.keys(acc);
        this.overrideItems.responses.push(
          ...Object.keys(e).filter((param) => props.includes(param))
        );
        Object.assign(acc, e);
        return acc;
      }, {});
  }

  /**
   * Set a new version to the swagger spec
   * @param swaggerSpec Swagger Spec to edit
   * @param version Version to set
   */
  private setVersion(swaggerSpec: any, version: string) {
    if (!swaggerSpec) {
      return swaggerSpec;
    }

    if (swaggerSpec.info) {
      swaggerSpec.info.version = version;
    } else {
      swaggerSpec.info = {
        version
      };
    }
    return swaggerSpec;
  }

  /**
   * Build the set of swagger specs to one Swagger Spec Object
   * @param options Build options
   */
  public async build(options?: BuildOptions): Promise<Spec> {
    await this.reset();
    const envelop = await this.buildEnvelop();
    const tags = await this.buildTags();
    const parameters = await this.buildParameters();
    const paths = await this.buildPaths(options && options.ignoreConflict);
    const definitions = await this.buildDefinitions();
    const responses = await this.buildResponses();

    let basicSwaggerSpec: Partial<Spec> = { ...envelop, tags, parameters, paths, definitions, responses };

    do {
      this.outerReferences = [];
      await this.extractOuterRef(basicSwaggerSpec);
      if (this.outerReferences.length > 0) {
        basicSwaggerSpec = await this.applyExternalRefItems(basicSwaggerSpec);
      }
    } while (this.outerReferences.length > 0);
    if (options && options.setVersion) {
      basicSwaggerSpec = this.setVersion(basicSwaggerSpec, options.setVersion);
    }

    if (basicSwaggerSpec.responses && Object.keys(basicSwaggerSpec.responses).length === 0) {
      delete basicSwaggerSpec.responses;
    }

    return basicSwaggerSpec as Spec;
  }
}
