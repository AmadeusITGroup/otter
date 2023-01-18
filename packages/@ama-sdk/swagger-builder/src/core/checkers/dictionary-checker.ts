import { SwaggerSpec } from '../swagger-spec-wrappers/swagger-spec.interface';
import { Checker, Report } from './checker.interface';

/** Dictionary reference object */
export interface DictionaryReference {
  /** Field name to generate after dictionary reviving */
  fieldName?: string;
  /** Field name to generate after map dictionary reviving */
  mapName?: string;
  /** Field type to generate after dictionary reviving */
  fieldType: string;
  /** Name of the field in the dictionary */
  dictionaryName: string;
  /** Name of the definitions where the dictionary reference come from */
  requestedBy: string;
  /** Name of the field where the dictionary reference come from */
  originField: string;
  /** Determine is the reference is from a required field */
  isRequired: boolean;
}

/** Definition with the list of references associated to the definition */
export interface DefinitionWithRefs {
  /** Swagger node of the definition */
  swagger: any;
  /** List of the definitions that the current definition is referring to */
  referTo: string[];
  /** List of the definitions that refer the current definition */
  referredBy: string[];
  /** List of the reply definitions that refer the current definition */
  associatedReplies: string[];
  /** List of dictionaries that is required by the definition */
  dictionaryReferences: { [field: string]: DictionaryReference };
}

/**
 * Checker for dictionary references
 */
export class DictionaryChecker implements Checker {

  /**
   * Extract definition names referred in the whole Swagger node
   *
   * @param currentNode Swagger Node to inspect
   * @param definitionNameMemory List of the definitions to extract
   * @param field current inspected object field name
   */
  private async extractDefinitionNameReferenced(currentNode: any, definitionNameMemory: string[], field?: string): Promise<void> {
    if (currentNode === undefined || currentNode === null) {
      return;
    } else if (field === '$ref') {
      if (typeof currentNode === 'string' && /\/definitions\//.test(currentNode)) {
        const splitRef = currentNode.split('/');
        definitionNameMemory.push(splitRef[splitRef.length - 1]);
      }
      return;
    } else if (Array.isArray(currentNode)) {
      await Promise.all(
        currentNode.map((n) => this.extractDefinitionNameReferenced(n, definitionNameMemory))
      );

    } else if (typeof currentNode === 'object') {
      for (const k of Object.keys(currentNode)) {
        await this.extractDefinitionNameReferenced(currentNode[k], definitionNameMemory, k);
      }
    }
  }

  /**
   * Extract dictionary references in the whole Swagger node
   *
   * @param currentNode Swagger Node to inspect
   * @param dictionaryMemory List of the dictionaries to extract
   * @param field current inspected object field name
   * @param requiredFields list of required field in node
   */
  private async extractDictionaryReferences(currentNode: any, dictionaryMemory: { [field: string]: DictionaryReference }, field?: string, requiredFields: string[] = []): Promise<void> {
    if (currentNode === undefined || currentNode === null) {
      return;

    } else if (Array.isArray(currentNode)) {
      await Promise.all(
        currentNode.map((n) => this.extractDictionaryReferences(n, dictionaryMemory))
      );

    } else if (typeof currentNode === 'object') {
      if (currentNode.type === 'object') {
        const requiredList: string[] = Array.isArray(currentNode.required) ? currentNode.required : [];
        for (const k of Object.keys(currentNode.properties || {})) {
          await this.extractDictionaryReferences(currentNode.properties[k], dictionaryMemory, k, requiredList);
        }
      } else {
        const keys = Object.keys(currentNode);
        if (field && keys.some((k) => /^x-(dictionary-name|field-type|field-name|map-name)/.test(k))) {
          dictionaryMemory[field] = {
            dictionaryName: currentNode['x-dictionary-name'],
            fieldType: currentNode['x-field-type'],
            fieldName: currentNode['x-field-name'],
            mapName: currentNode['x-map-name'],
            requestedBy: 'unknown',
            originField: field,
            isRequired: requiredFields.indexOf(field) > -1
          };
        }
        for (const k of keys) {
          await this.extractDictionaryReferences(currentNode[k], dictionaryMemory, k);
        }
      }
    }
  }

  /**
   * Get the responses Swagger Node for a Path Swagger Node
   *
   * @param currentNode Path Swagger Node to inspect
   * @param field current inspected object field name
   */
  private getResponsesNode(currentNode: any, field?: string): any | undefined {
    if (currentNode === undefined || currentNode === null) {
      return;
    } else if (field === 'responses') {
      return currentNode;
    } else if (Array.isArray(currentNode)) {
      return currentNode
        .reduce((acc, n) => acc || this.getResponsesNode(n), undefined);
    } else if (typeof currentNode === 'object') {
      return Object.keys(currentNode)
        .reduce((acc, k) => acc || this.getResponsesNode(currentNode[k], k), undefined);
    }
  }

  /**
   * Get the list of Reply Definitions referred inside the Path Swagger Node
   *
   * @param pathNode Path Swagger Node to inspect
   */
  private async getReplyDefinitionsFromPath(pathNode: any): Promise<string[]> {
    const ret: string[] = [];
    const responsesNode = this.getResponsesNode(pathNode);
    if (responsesNode) {
      await this.extractDefinitionNameReferenced(responsesNode, ret);
    }

    return ret.reduce<string[]>((acc, cur) => {
      if (acc.indexOf(cur) === -1) {
        acc.push(cur);
      }
      return acc;
    }, []);
  }

  /**
   * Find the list of definition referred by the given Swagger Definition
   *
   * @param definition Definition name
   * @param definitions List of Definition Swagger Node
   */
  private async findReferToDefinitions(definition: string, definitions: { [name: string]: any }): Promise<string[]> {
    const ret: string[] = [];
    await this.extractDefinitionNameReferenced(definitions[definition], ret);
    return ret;
  }

  /**
   * Find the list of dictionaries referred by the given Swagger Definition
   *
   * @param definition Definition name
   * @param definitions List of Definition Swagger Node
   */
  private async findDictionaryReferences(definition: string, definitions: { [name: string]: any }): Promise<{ [field: string]: DictionaryReference}> {
    const ret: { [field: string]: DictionaryReference } = {};
    await this.extractDictionaryReferences(definitions[definition], ret);
    return Object.keys(ret)
      .reduce<{ [field: string]: DictionaryReference }>((acc, refName) => {
        acc[refName] = {
          ...ret[refName],
          requestedBy: definition
        };
        return acc;
      }, {});
  }

  /**
   * Find the list of definition referring the given Swagger Definition
   *
   * @param definition Definition name
   * @param definitions List of Definition Swagger Node
   */
  private findReferredByDefinitions(definition: string, definitions: { [definitionName: string]: DefinitionWithRefs }): string[] {
    return Object.keys(definitions)
      .filter((definitionName) => definitions[definitionName].referTo.indexOf(definition) >= 0);
  }

  private async getReplyDefinitions(paths: {[name: string]: any}): Promise<string[]> {
    const replyDefinitions: string[] = [];

    for (const pName of Object.keys(paths)) {
      const replyDefinitionsPath = await this.getReplyDefinitionsFromPath(paths[pName]);
      replyDefinitions.push(...replyDefinitionsPath.filter((def) => replyDefinitions.indexOf(def) === -1));
    }

    return replyDefinitions;
  }

  /**
   * Find the reply definitions referring the given definition
   *
   * @param definitionName Definition name
   * @param replyDefinitions List of reply Definitions Swagger Node
   * @param definitions List of Definition Swagger Node
   * @param stack stack of swagger fields
   */
  private findAssociatedRepliesFor(definitionName: string, replyDefinitions: string[], definitions: { [definitionName: string]: DefinitionWithRefs }, stack: string[] = []): string[] {
    const definition = definitions[definitionName];
    if (definition.associatedReplies.length) {
      return definition.associatedReplies;
    }

    if (replyDefinitions.indexOf(definitionName) >= 0) {
      return [definitionName];
    }

    if (stack.indexOf(definitionName) >= 0) {
      return [];
    }

    if (!definition.referredBy.length) {
      return [];
    }

    stack = [...stack, definitionName];
    return definition.referredBy
      .map((defName) => this.findAssociatedRepliesFor(defName, replyDefinitions, definitions, stack))
      .reduce((acc, cur) => {
        acc.push(...cur.filter((item) => acc.indexOf(item) === -1));
        return acc;
      }, []);
  }

  /**
   * Generate the definition with the list of references associated to it
   *
   * @param swaggerSpec Swagger specification object
   */
  private async generateDefinitionsWithRefererLists(swaggerSpec: SwaggerSpec): Promise<{ definitionsWithReferer: { [definitionName: string]: DefinitionWithRefs }; replyDefinitions: string[] }> {
    const definitions = await swaggerSpec.getDefinitions();
    const paths = await swaggerSpec.getPaths();
    const definitionsWithReferer: { [definitionName: string]: DefinitionWithRefs } = {};
    const replyDefinitions = await this.getReplyDefinitions(paths);

    for (const definitionName of Object.keys(definitions)) {
      definitionsWithReferer[definitionName] = {
        swagger: definitions[definitionName],
        referTo: await this.findReferToDefinitions(definitionName, definitions),
        referredBy: [],
        associatedReplies: [],
        dictionaryReferences: await this.findDictionaryReferences(definitionName, definitions)
      };
    }

    Object.keys(definitionsWithReferer)
      .forEach((definitionName) => {
        definitionsWithReferer[definitionName].referredBy = this.findReferredByDefinitions(definitionName, definitionsWithReferer);
        definitionsWithReferer[definitionName].associatedReplies = this.findAssociatedRepliesFor(definitionName, replyDefinitions, definitionsWithReferer);
      });

    return {
      definitionsWithReferer,
      replyDefinitions
    };
  }

  /**
   * Get all the dictionary referenced by the given definition
   *
   * @param definitionName Definition name
   * @param definitions List of Definition Swagger Node
   * @param stack stack of swagger fields
   */
  private getAllDictionaryRefs(definitionName: string, definitions: {[definitionName: string]: DefinitionWithRefs}, stack: string[] = []): DictionaryReference[] {
    if (stack.indexOf(definitionName) >= 0) {
      return [];
    }

    const definition = definitions[definitionName];
    const references = Object.keys(definition.dictionaryReferences).map((refName) => definition.dictionaryReferences[refName]);
    stack = [...stack, definitionName];

    return [
      ...references,
      ...definition.referTo
        .map((defName) => this.getAllDictionaryRefs(defName, definitions, stack))
        .reduce((acc, cur) => {
          acc.push(...cur);
          return acc;
        }, [])
    ];
  }

  /**
   * Determine if the given dictionary reference is targeting the given Definition Swagger Node
   *
   * @param currentNode Path Swagger Node to inspect
   * @param dictionaryReference Dictionary reference
   * @param field current inspected object field name
   */
  private isDictionaryInDefinitionNode(currentNode: any, dictionaryReference: DictionaryReference, field?: string): boolean {
    if (currentNode === undefined || currentNode === null) {
      return false;
    } else if (typeof currentNode === 'object' && field === dictionaryReference.dictionaryName) {
      const resource = currentNode.$ref ||
        (currentNode.additionalProperties && currentNode.additionalProperties.$ref) ||
        (currentNode.additionalProperties && currentNode.additionalProperties.type) ||
        currentNode.type;
      return new RegExp(dictionaryReference.fieldType + '$').test(resource);
    } else if (Array.isArray(currentNode)) {
      return currentNode
        .reduce<boolean>((acc, n) => acc || this.isDictionaryInDefinitionNode(n, dictionaryReference), false);
    } else if (typeof currentNode === 'object') {
      return Object.keys(currentNode)
        .reduce<boolean>((acc, k) => acc || this.isDictionaryInDefinitionNode(currentNode[k], dictionaryReference, k), false);
    }

    return false;
  }

  /**
   * Determine if the given dictionary reference is targeting the given definition
   *
   * @param dictionaryReference Dictionary reference
   * @param definitionName Definition name
   * @param definitions List of Definition Swagger Node
   * @param stack stack of swagger fields
   */
  private isDictionaryInDefinition(dictionaryReference: DictionaryReference, definitionName: string, definitions: {[definitionName: string]: DefinitionWithRefs}, stack: string[] = []): boolean {
    if (stack.indexOf(definitionName) > -1) {
      return false;
    }

    const definition = definitions[definitionName];
    if (this.isDictionaryInDefinitionNode(definition.swagger, dictionaryReference)) {
      return true;
    }

    stack = [...stack, definitionName];
    return definition.referTo
      .reduce<boolean>((acc, defName) => acc || this.isDictionaryInDefinition(dictionaryReference, defName, definitions, stack), false);
  }

  /**
   * Find the reference paths from one specification to another.
   *
   * @param from Definition from which we need to find a path
   * @param to Definition to which we need to find a path
   * @param definitions List of Definition Swagger Node
   * @param currentPath Current path in the recursion
   */
  private findReferencePaths(from: string, to: string, definitions: { [definitionName: string]: DefinitionWithRefs }, currentPath: string[] = []): string[][] {
    const definition = definitions[from];

    if (currentPath.includes(from)) {
      // circular loop, we stop here
      return [];
    }

    currentPath = [...currentPath, from];
    if (from === to) {
      return [currentPath];
    } else if (!definition.referTo.length) {
      return [];
    }

    return definitions[from].referTo
      .map((ref) => this.findReferencePaths(ref, to, definitions, currentPath)
        .filter((refs) => refs.length)
      )
      .reduce<string[][]>((pathList, nextResolvingPaths) => {
        pathList.push(
          ...nextResolvingPaths.filter((nextResolvingPath) => pathList.map((p) => p.join()).indexOf(nextResolvingPath.join()))
        );
        return pathList;
      }, []);
  }

  /**
   * Check a the dictionary references of a DxAPI Type Swagger Specification
   *
   * @param swaggerSpec Swagger specification
   */
  public async check(swaggerSpec: SwaggerSpec): Promise<Report> {

    const {definitionsWithReferer, replyDefinitions} = await this.generateDefinitionsWithRefererLists(swaggerSpec);
    const report: Report = [];
    for (const replyDefinition of replyDefinitions) {
      const dictionaryReferences = this.getAllDictionaryRefs(replyDefinition, definitionsWithReferer);
      report.push(
        ...dictionaryReferences
          .filter((dictionaryReference) => !this.isDictionaryInDefinition(dictionaryReference, replyDefinition, definitionsWithReferer))
          .map((dictionaryReference) => ({
            // eslint-disable-next-line max-len
            message: `The dictionary ${dictionaryReference.dictionaryName} (type: ${dictionaryReference.fieldType}${dictionaryReference.isRequired ? ', required' : ''}) referred by ${dictionaryReference.requestedBy}.${dictionaryReference.originField} is missing in ${replyDefinition}`,
            details: this.findReferencePaths(replyDefinition, dictionaryReference.requestedBy, definitionsWithReferer)
              .map((refPath) => `Path from ${replyDefinition} to ${dictionaryReference.requestedBy}: ${refPath.join(' -> ')}`),
            swaggerNode: replyDefinition
          }))
          .reduce<Report>((acc, cur) => {
            if (!acc.some((r) => r.swaggerNode === cur.swaggerNode && r.message === cur.message)) {
              acc.push(cur);
            }
            return acc;
          }, [])
      );
    }

    return report;
  }

}
