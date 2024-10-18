import { findReferences, getDefinitionsDeeplyAccessibleFromPaths, getDiscriminatorLinks, getTags } from '../../helpers/spec-parser';
import { PostProcess } from './post-process.interface';
import { TreeShakingStrategy } from '../../interfaces/builder-configuration';

/**
 * Post Process to Tree shake the final Swagger specification
 */
export class TreeShaker implements PostProcess {

  /**
   * Remove all tags not accessible from paths
   * @param spec
   * @private
   */
  private removeUnusedTags(spec: any) {
    const tags = getTags(spec);
    spec.tags = spec.tags.filter((tag: { name: string }) => tags.includes(tag.name));
  }

  /**
   * Remove all parameters not accessible from paths
   * @param spec
   * @private
   */
  private async removeUnusedParameters(spec: any) {
    const parameterReferences = (await findReferences(spec.paths)).filter((ref) => ref.type === 'parameters');
    spec.parameters = Object.fromEntries(Object.entries(spec.parameters)
      .filter(([parameterName]) => parameterReferences.some((ref) => ref.name === parameterName))
    );
  }

  /**
   * Start from paths and only keep deeply accessible definitions
   * @param spec
   * @private
   */
  private async removeUnusedDefinitionsTopDownStrategy(spec: any) {
    const discriminatorRefs = getDiscriminatorLinks(spec);
    const accessibleDefinitions = await getDefinitionsDeeplyAccessibleFromPaths(spec, discriminatorRefs);
    spec.definitions = Object.fromEntries(Object.entries(spec.definitions)
      .filter(([definitionName]) => accessibleDefinitions.has(definitionName))
    );
  }

  /**
   * Start from definitions and recursively remove all unreferenced, cannot remove cyclic dependencies
   * @param spec
   * @private
   */
  private async removeUnusedDefinitionsBottomUpStrategy(spec: any) {
    let nbEntities: number;
    do {
      nbEntities = Object.keys(spec.definitions).length;
      const references = await findReferences(spec);
      const discriminatorRefs = getDiscriminatorLinks(spec);

      spec.definitions = Object.fromEntries(Object.entries(spec.definitions)
        .filter(([definitionName]) =>
          references.some((ref) => ref.type === 'definitions' && ref.name === definitionName)
          || Object.keys(discriminatorRefs).some((discriminatorModel) =>
            spec.definitions[discriminatorModel] && discriminatorRefs[discriminatorModel].includes(definitionName))
        )
      );
    } while (nbEntities !== Object.keys(spec.definitions).length);
  }

  /** @inheritdoc */
  public async execute(swaggerSpec: any, treeShakingStrategy: TreeShakingStrategy = 'bottom-up'): Promise<any> {
    const spec = {...swaggerSpec};
    this.removeUnusedTags(spec);
    await this.removeUnusedParameters(spec);
    if ('bottom-up' === treeShakingStrategy) {
      await this.removeUnusedDefinitionsBottomUpStrategy(spec);
    }
    else if ('top-down' === treeShakingStrategy) {
      await this.removeUnusedDefinitionsTopDownStrategy(spec);
    }
    return spec;
  }
}
