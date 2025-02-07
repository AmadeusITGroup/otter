import {
  PostProcess,
} from './post-process.interface';

/**
 * Post Process to validate a given Swagger spec
 */
export class PropagateXvendor implements PostProcess {
  constructor(private readonly vendorExtToPropagate = 'x-unknown') {}

  private getRecApiFlag(definitionName: string, definition: any, originDefs: any, processedDefs: any) {
    if (!definition.allOf || definition[this.vendorExtToPropagate]) {
      processedDefs[definitionName] = definition;
    } else {
      const captureDefinitionRegExp = /#\/definitions\/(.*)/;
      const parentWithFlag = (definition.allOf as any[]).filter((ref: any): ref is { $ref: string } => !!ref.$ref)
        .map((ref) => {
          const defName = captureDefinitionRegExp.exec(ref.$ref)![1];
          return {
            name: defName,
            value: originDefs[defName]
          };
        })
        .find((defEntry) => {
          if (!processedDefs[defEntry.name]) {
            this.getRecApiFlag(defEntry.name, defEntry.value, originDefs, processedDefs);
          }
          const parentFlag = processedDefs[defEntry.name][this.vendorExtToPropagate];
          if (parentFlag) {
            const defCopy = { ...definition };
            defCopy[this.vendorExtToPropagate] = parentFlag;
            processedDefs[definitionName] = defCopy;
          }
          return !!parentFlag;
        });
      if (!parentWithFlag) {
        processedDefs[definitionName] = definition;
      }
    }
  }

  private processDefinitions(definitions: any): any {
    const result = {};
    Object.entries(definitions).forEach(([definitionName, definition]) =>
      this.getRecApiFlag(definitionName, definition, definitions, result));
    return result;
  }

  /** @inheritdoc */
  public execute(swaggerSpec: any) {
    // eslint-disable-next-line no-console -- no logger available
    console.info('Propagate flag: ' + this.vendorExtToPropagate);
    return {
      ...swaggerSpec,
      definitions: this.processDefinitions(swaggerSpec.definitions)
    };
  }
}
