import {
  PostProcess
} from './post-process.interface';

/**
 * Post Process to add x-api-ref flag in definition
 */
export class FlagDefinition implements PostProcess {
  /** @inheritdoc */
  public execute(swaggerSpec: any) {
    const spec = { ...swaggerSpec,
      definitions: Object.entries(swaggerSpec.definitions).reduce((definitions, [definitionName, definition]) => {
        definitions[definitionName] = {
          ...definition as any,
          // eslint-disable-next-line @typescript-eslint/naming-convention -- naming convention imposed for x-api-ref
          'x-api-ref': definitionName
        };
        return definitions;
      }, {} as Record<string, any>)
    };
    return spec;
  }
}
