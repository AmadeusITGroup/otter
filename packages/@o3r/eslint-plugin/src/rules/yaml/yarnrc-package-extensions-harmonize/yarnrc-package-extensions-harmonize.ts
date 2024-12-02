import * as path from 'node:path';
import * as semver from 'semver';
import {
  type AST,
  getStaticYAMLValue,
} from 'yaml-eslint-parser';
import {
  findWorkspacePackageJsons,
  getBestRanges,
} from '../../json/json-dependency-versions-harmonize/version-harmonize';
import {
  createRule,
} from '../../utils';
import {
  getYamlParserServices,
} from '../utils';

export interface YarnrcPackageExtensionsHarmonizeOptions {
  /** List of package.json to ignore when determining the dependencies versions */
  excludePackages: string[];

  /** List of dependency types in package.json to parse */
  dependencyTypesInPackages: string[];

  /** List of dependencies to ignore */
  ignoredDependencies: string[];

  /** List of dependency types to validate in .yarnrc.yml */
  yarnrcDependencyTypes: string[];
}

const defaultOptions: [YarnrcPackageExtensionsHarmonizeOptions] = [{
  ignoredDependencies: [],
  excludePackages: [],
  yarnrcDependencyTypes: ['peerDependencies', 'dependencies'],
  dependencyTypesInPackages: ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies', 'generatorDependencies']
}];

export default createRule<[YarnrcPackageExtensionsHarmonizeOptions, ...any], 'versionUpdate' | 'error'>({
  name: 'yarnrc-package-extensions-harmonize',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Ensure that the package extension versions are aligned with the range defined in the packages.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          excludePackages: {
            type: 'array',
            description: 'List of package.json to ignore when determining the dependencies versions',
            items: {
              type: 'string'
            }
          },
          yarnrcDependencyTypes: {
            type: 'array',
            description: 'List of dependency types to validate in .yarnrc.yml',
            default: defaultOptions[0].yarnrcDependencyTypes,
            items: {
              type: 'string'
            }
          },
          dependencyTypesInPackages: {
            type: 'array',
            description: 'List of dependency types in package.json to parse',
            default: defaultOptions[0].dependencyTypesInPackages,
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
  create: (context, [options]: Readonly<[YarnrcPackageExtensionsHarmonizeOptions, ...any]>) => {
    const parserServices = getYamlParserServices(context);
    const dirname = path.dirname(context.filename);
    const workspace = findWorkspacePackageJsons(dirname);
    const bestRanges = workspace
      ? getBestRanges(options.dependencyTypesInPackages, workspace.packages.filter(({ content }) => !content.name || !options.excludePackages.includes(content.name)))
      : {};
    const ignoredDependencies = options.ignoredDependencies.map((dep) => new RegExp(dep.replace(/[$()+.?[\\\]^{|}]/g, '\\$&').replace(/\*/g, '.*')));

    if (parserServices.isYAML) {
      const rule = (node: AST.YAMLPair) => {
        if (node.value) {
          const range = getStaticYAMLValue(node.value)?.toString();
          const parent = node.parent.parent && node.parent.parent.type === 'YAMLPair' && getStaticYAMLValue(node.parent.parent.key!)?.toString();
          const baseNode = node.parent.parent.parent.parent?.parent?.parent;
          const isCorrectNode = baseNode && baseNode.type === 'YAMLPair' && getStaticYAMLValue(baseNode.key!)?.toString() === 'packageExtensions';
          if (isCorrectNode && semver.validRange(range) && parent && options.yarnrcDependencyTypes.includes(parent)) {
            const depName = node.key && getStaticYAMLValue(node.key)?.toString();
            if (!depName || !bestRanges[depName] || ignoredDependencies.some((ignore) => ignore.test(depName))) {
              return;
            }
            const minYarnrcVersion = semver.minVersion(range!);
            const minBestRangeVersion = semver.minVersion(bestRanges[depName].range);
            if (minYarnrcVersion && minBestRangeVersion && semver.lt(minYarnrcVersion, minBestRangeVersion)) {
              const version = bestRanges[depName].range;
              const packageJsonFile = bestRanges[depName].path;
              context.report({
                loc: node.value.loc,
                messageId: 'error',
                data: {
                  depName,
                  version,
                  packageJsonFile
                },
                fix: (fixer) => fixer.replaceTextRange(node.value!.range, `${version}`),
                suggest: [
                  {
                    messageId: 'versionUpdate',
                    data: {
                      version
                    },
                    fix: (fixer) => fixer.replaceTextRange(node.value!.range, `${version}`)
                  }
                ]
              });
            }
          }
        }
      };

      return {
        YAMLPair: rule
      };
    }
    return {};
  }
});
