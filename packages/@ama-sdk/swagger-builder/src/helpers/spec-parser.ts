export interface Reference {
  type: string;
  name: string;
}

export interface DiscriminatorRefs {
  /**
   * key is the parent definition, value is the list of all children
   */
  [model: string]: string[];
}

/**
 * Get the list of tags used in paths
 * @param spec Swagger specification
 */
export function getTags(spec: any) {
  const tags = new Set<string>();
  if (spec && spec.paths) {
    Object.values(spec.paths).forEach((path: any) => {
      Object.values(path).forEach((method: any) => {
        (method.tags || []).forEach((tag: string) => {
          tags.add(tag);
        });
      });
    });
  }
  return Array.from(tags);
}

/**
 * Find the references from the Swagger specification node
 * @param startingNode Current node to treat
 * @param startingField Name of the current field to treat
 */
export async function findReferences(startingNode: any, startingField?: string): Promise<Reference[]> {
  const references: Reference[] = [];
  const findReferencesRec = async (currentNode: any, field?: string) => {
    if (currentNode !== undefined && currentNode !== null) {
      if (field === '$ref' && typeof currentNode === 'string') {
        const [refType, refName] = currentNode.replace(/^#\//, '').split('/');
        if (!references.some(({ type, name }) => type === refType && name === refName)) {
          references.push({ name: refName, type: refType });
        }
      } else if (Array.isArray(currentNode)) {
        await Promise.all(currentNode.map((n) => findReferencesRec(n)));
      } else if (typeof currentNode === 'object') {
        await Promise.all(Object.entries(currentNode).map(([k, v]) => findReferencesRec(v, k)));
      }
    }
  };
  await findReferencesRec(startingNode, startingField);
  return references;
}

/**
 * Find the discriminator field reference in the current node
 * @param currentNode Current node to treat
 * @param discriminator Discriminator field name
 */
function findDiscriminatorField(currentNode: any, discriminator: string) {
  if (currentNode.properties) {
    return currentNode.properties[discriminator];
  } else if (currentNode.allOf) {
    return currentNode.allOf
      .map((node: any) => findDiscriminatorField(node, discriminator))
      .find((discrimination: any) => !!discrimination);
  }
}

/**
 * Get the a map of definition with discriminator mapped to the possible specified child definitions
 * @param spec Swagger specification
 */
export function getDiscriminatorLinks(spec: any): DiscriminatorRefs {
  return Object.keys(spec.definitions)
    .filter((definitionName) => !!spec.definitions[definitionName].discriminator)
    .map((definitionName) => {
      const discriminator = spec.definitions[definitionName].discriminator;
      const discriminatorNode = findDiscriminatorField(spec.definitions[definitionName], discriminator);
      return {
        definitionName,
        refs: (discriminatorNode && discriminatorNode.enum) || []
      };
    })
    .reduce<{ [model: string]: string[] }>((acc, { definitionName, refs }) => {
      if (refs.length > 0) {
        acc[definitionName] = refs;
      }
      return acc;
    }, {});
}

/**
 * Get a set containing all the definitions deeply accessible from at least one of the paths of the spec
 * @param spec
 * @param discriminatorRefs
 */
export async function getDefinitionsDeeplyAccessibleFromPaths(spec: any, discriminatorRefs: DiscriminatorRefs) {
  const references = await findReferences(spec.paths);
  // init with definitions directly accessible from paths
  const accessibleDefinitions = new Set(references
    .filter((ref) => ref.type === 'definitions')
    .map((ref) => ref.name)
  );

  // compute definitions directly accessible for all the definitions
  const definitionDescendants: Record<string, string[]> = {};
  for (const definitionName of Object.keys(spec.definitions)) {
    const defRefs = await findReferences(spec.definitions[definitionName]);
    definitionDescendants[definitionName] = defRefs.map((ref) => ref.name);
  }

  // recursively add all the definitions directly accessible until no new definition is added
  const isDefinitionComputed: Record<string, boolean> = {};
  while (Object.keys(isDefinitionComputed).length !== accessibleDefinitions.size) {
    accessibleDefinitions.forEach((definitionName) => {
      if (!isDefinitionComputed[definitionName]) {
        if (definitionDescendants[definitionName]) {
          definitionDescendants[definitionName].forEach((descendant) => {
            accessibleDefinitions.add(descendant);
          });
        }
        Object.entries(discriminatorRefs).forEach(([discriminatorModel, discriminatorNames]) => {
          if (discriminatorModel === definitionName) {
            discriminatorNames.forEach((discriminatorName) => {
              accessibleDefinitions.add(discriminatorName);
            });
          }
        });
        isDefinitionComputed[definitionName] = true;
      }
    });
  }
  return accessibleDefinitions;
}
