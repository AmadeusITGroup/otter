import * as path from 'node:path';
import * as semver from 'semver';
import { createRule } from '../../utils';
import { getJsoncParserServices } from '../utils';
import type { AST } from 'jsonc-eslint-parser';
import { findWorkspacePackageJsons, getBestRange, getBestRanges } from './version-harmonize';

interface Options {
  /** List of package name to ignore when determining the dependencies versions */
  ignoredPackages: string[];
  /** List of dependencies to ignore */
  ignoredDependencies: string[];
  /** List of dependency types to update */
  dependencyTypes: string[];
  /**
   * Enforce to align the version of the dependencies with the latest range.
   * If not set, the version will be aligned with the latest range if the latest range is not intersected with the current range.
   */
  alignPeerDependencies: boolean;
}

const defaultOptions: [Options] = [{
  ignoredDependencies: [],
  dependencyTypes: ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies', 'generatorDependencies'],
  alignPeerDependencies: false,
  ignoredPackages: []
}];

export default createRule<[Options, ...any], 'versionUpdate' | 'error', any>({
  name: 'json-dependency-versions-harmonize',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Ensure that the package dependency versions are aligned with the other package of the workspace.',
      recommended: 'error'
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
  create: (context, [options]: [Options]) => {
    const parserServices = getJsoncParserServices(context);
    const dirname = path.dirname(context.getFilename());
    const workspace = findWorkspacePackageJsons(dirname);
    const bestRanges = workspace && getBestRanges(options.dependencyTypes, workspace.packages.filter(({ content }) => !content.name || !options.ignoredPackages.includes(content.name)));
    const ignoredDependencies = options.ignoredDependencies.map((dep) => new RegExp(dep.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')));

    if (parserServices.isJSON) {
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'JSONExpressionStatement': (node: AST.JSONExpressionStatement) => {
          if (node.expression.type === 'JSONObjectExpression') {
            const deps = node.expression.properties
              .filter(({ key }) => options.dependencyTypes.includes(key.type === 'JSONLiteral' ? key.value.toString() : key.name));
            if (deps.length > 0 && bestRanges) {
              deps
                .map((depGroup) => depGroup.value)
                .filter((depGroup): depGroup is AST.JSONObjectExpression => depGroup.type === 'JSONObjectExpression')
                .forEach((depGroup) => {
                  depGroup.properties.forEach((dep) => {
                    const name = dep.key.type === 'JSONLiteral' ? dep.key.value.toString() : dep.key.name;
                    if (ignoredDependencies.some((ignore) => ignore.test(name))) {
                      return;
                    }
                    const range = dep.value.type === 'JSONLiteral' ? dep.value.value as string : (dep.value.type === 'JSONIdentifier' ? dep.value.name : undefined);
                    const bestRange = getBestRange(range, bestRanges[name]?.range);
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
                          packageJsonFile: bestRanges[name].path
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
                  });
                });
            }
          }
        }
      };
    }
  }
});
