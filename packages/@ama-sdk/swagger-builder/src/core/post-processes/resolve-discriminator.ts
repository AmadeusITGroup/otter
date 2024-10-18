import {
  PostProcess
} from './post-process.interface';

/**
 * Post Process to validate a given Swagger spec
 */
export class ResolveDiscriminator implements PostProcess {
  private readonly captureDefinitionRegExp = /#\/definitions\/(.*)/;

  private resolveDiscriminator(definitionName: string, definition: any, processedDefs: any, discriminator?: string) {
    if (discriminator) {
      // Looked up discriminator found at definition level.
      if (discriminator === definition.discriminator) {
        // Delete the discriminator in this case
        processedDefs[definitionName] = { ...definition };
        delete processedDefs[definitionName].discriminator;
        // eslint-disable-next-line no-console
        console.info('Discriminator ' + discriminator + ' removed from ' + definitionName);
      }
      if (definition.allOf) {
        // Delete the discriminator at allOf level if found
        processedDefs[definitionName].allOf = (definition.allOf as any[]).map((allOfLine) => {
          if (!allOfLine.discriminator) {
            return allOfLine;
          }
          const newLine = { ...definition.allOf };
          delete newLine.discriminator;
          // eslint-disable-next-line no-console
          console.info('Discriminator ' + discriminator + ' removed the AllOf of ' + definitionName);
          return newLine;
        });
        (definition.allOf as any[]).filter((ref: any): ref is { $ref: string } => !!ref.$ref)
          .forEach((ref) => {
            // Call recursively the resolver on the parents
            const parentDefName = this.captureDefinitionRegExp.exec(ref.$ref)![1];
            this.resolveDiscriminator(parentDefName, processedDefs[parentDefName], processedDefs, discriminator);
          });
      }
    } else {
      const inlineDiscDef = definition.allOf && (definition.allOf as any[]).find((allOfDef) => !!allOfDef.discriminator);
      if (inlineDiscDef) {
        (definition.allOf as any[]).filter((ref: any): ref is { $ref: string } => !!ref.$ref)
          .forEach((ref) => {
            const parentDefName = this.captureDefinitionRegExp.exec(ref.$ref)![1];
            // discriminator found on a property inside an allOf, call recursively the resolver to find if it appears on a parent definition
            this.resolveDiscriminator(parentDefName, processedDefs[parentDefName], processedDefs, inlineDiscDef.discriminator);
          });
      }
    }
  }

  private processDefinitions(definitions: any): any {
    const result = { ...definitions };
    Object.entries(result as [string, any]).forEach(([definitionName, definition]) => {
      this.resolveDiscriminator(definitionName, definition, result);
    });
    return result;
  }

  /** @inheritdoc */
  public execute(swaggerSpec: any) {
    // eslint-disable-next-line no-console
    console.info('Resolve discriminator...');
    return {
      ...swaggerSpec,
      definitions: this.processDefinitions(swaggerSpec.definitions)
    };
  }
}
