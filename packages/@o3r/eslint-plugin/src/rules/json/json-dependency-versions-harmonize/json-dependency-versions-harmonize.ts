import * as path from 'node:path';
import * as semver from 'semver';
import { createRule } from '../../utils';
import { getJsoncParserServices } from '../utils';
import type { AST } from 'jsonc-eslint-parser';
import { findWorkspacePackageJsons, getBestRange, getBestRanges } from './version-harmonize';

interface Options {
  /** List of package name to ignore when determining the dependencies versions */
  ignoredPackages?: string[];
  /** List of dependencies to ignore */
  ignoredDependencies?: string[];
  /** List of dependency types to update */
  dependencyTypes?: string[];
  /**
   * Enforce to align the version of the dependencies with the latest range.
   * If not set, the version will be aligned with the latest range if the latest range is not intersected with the current range.
   */
  alignPeerDependencies?: boolean;
  /** Align the resolutions/overrides dependency rules with the latest determined range */
  alignResolutions?: boolean;
}

const defaultOptions: [Required<Options>] = [{
  ignoredDependencies: [],
  dependencyTypes: ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies', 'generatorDependencies'],
  alignPeerDependencies: false,
  alignResolutions: true,
  ignoredPackages: []
}];

export default createRule<[Options, ...any], 'versionUpdate' | 'error'>({
  name: 'json-dependency-versions-harmonize',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Ensure that the package dependency versions are aligned with the other package of the workspace.',
      recommended: 'strict'
    },
    schema: [
      {
        type: 'object',
        properties: {
          alignPeerDependencies: {
            type: 'boolean',
            description: 'Enforce to align the version of the dependencies with the latest range.'
          },
          dependencyTypes: {
            type: 'array',
            description: 'List of dependency types to update',
            default: defaultOptions[0].dependencyTypes,
            items: {
              type: 'string'
            }
          },
          ignoredDependencies: {
            type: 'array',
            description: 'List of dependencies to ignore',
            items: {
              type: 'string'
            }
          },
          ignoredPackages: {
            type: 'array',
            description: 'List of package name to ignore when determining the dependencies versions',
            items: {
              type: 'string'
            }
          },
          alignResolutions: {
            type: 'boolean',
            description: 'Align the resolutions dependencies with the latest determined range.'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      versionUpdate: 'Set version {{version}}',
      error: '{{depName}} should be updated to version {{version}} (from: {{packageJsonFile}})'
    },
    fixable: 'code'
  },
  defaultOptions,
  create: (context, [options]: Readonly<[Options, ...any]>) => {
    const resolutionsFields = ['resolutions', 'overrides'];
    const parserServices = getJsoncParserServices(context);
    const dirname = path.dirname(context.getFilename());
    const workspace = findWorkspacePackageJsons(dirname);
    const bestRanges = workspace && getBestRanges(options.dependencyTypes!, workspace.packages.filter(({ content }) => !content.name || !options.ignoredPackages!.includes(content.name)));
    const ignoredDependencies = options.ignoredDependencies!.map((dep) => new RegExp(dep.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')));
    const dependencyTypes = [...options.dependencyTypes!, ...(options.alignResolutions ? resolutionsFields : [])];

    if (parserServices.isJSON) {
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'JSONExpressionStatement': (node: AST.JSONExpressionStatement) => {
          if (node.expression.type === 'JSONObjectExpression') {
            const deps = node.expression.properties
              .filter(({ key }) => dependencyTypes.includes(key.type === 'JSONLiteral' ? key.value.toString() : key.name));
            if (deps.length > 0 && bestRanges) {
              deps
                .map((depGroup) => depGroup.value)
                .filter((depGroup): depGroup is AST.JSONObjectExpression => depGroup.type === 'JSONObjectExpression')
                .forEach((depGroup) => {
                  const report = (name: string, resolvedName: string, dep: AST.JSONProperty, range: string | undefined, bestRange: string | undefined) => {
                    if (bestRange && bestRange !== range) {
                      if (!options.alignPeerDependencies && depGroup.parent.type === 'JSONProperty' && range &&
                        (depGroup.parent.key.type === 'JSONLiteral' ? depGroup.parent.key.value.toString() : depGroup.parent.key.name) === 'peerDependencies' &&
                        semver.subset(bestRange, range)) {
                        return;
                      }
                      context.report({
                        loc: dep.value.loc,
                        messageId: 'error',
                        data: {
                          depName: name,
                          version: bestRange,
                          packageJsonFile: bestRanges[resolvedName].path
                        },
                        fix: (fixer) => fixer.replaceTextRange(dep.value.range, `"${bestRange}"`),
                        suggest: [
                          {
                            messageId: 'versionUpdate',
                            data: {
                              version: bestRange
                            },
                            fix: (fixer) => fixer.replaceTextRange(dep.value.range, `"${bestRange}"`)
                          }
                        ]
                      });
                    }
                  };

                  depGroup.properties.forEach((dependencyNode) => {
                    const isResolutionsField = options.alignResolutions && depGroup.parent.type === 'JSONProperty' &&
                      resolutionsFields.includes(depGroup.parent.key.type === 'JSONLiteral' ? depGroup.parent.key.value.toString() : depGroup.parent.key.name);

                    const getNodeDetails = (dep: AST.JSONProperty): void => {
                      const name = dep.key.type === 'JSONLiteral' ? dep.key.value.toString() : dep.key.name;
                      const nameParts = name.split('/');
                      if (ignoredDependencies.some((ignore) => ignore.test(name))) {
                        return;
                      }

                      const range = dep.value.type === 'JSONLiteral' ? dep.value.value as string : (dep.value.type === 'JSONIdentifier' ? dep.value.name : undefined);
                      if (!range && dep.value.type === 'JSONObjectExpression') {
                        return dep.value.properties
                          .forEach((prop) => getNodeDetails(prop));
                      }

                      const resolutionSubNameIndex = isResolutionsField ? nameParts.findIndex((_, i) => !!bestRanges[nameParts.slice(nameParts.length - i).join('/')]) : -1;
                      const resolvedName = resolutionSubNameIndex > -1 ? nameParts.slice(nameParts.length - resolutionSubNameIndex).join('/') : name;
                      const bestRange = getBestRange(range, bestRanges[resolvedName]?.range);

                      report(name, resolvedName, dep, range, bestRange);
                    };

                    getNodeDetails(dependencyNode);
                  });
                });
            }
          }
        }
      };
    }
    return {};
  }
});
