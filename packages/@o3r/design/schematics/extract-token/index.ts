import {
  posix,
  resolve,
} from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import type {
  createOtterSchematic,
} from '@o3r/schematics';
import {
  AUTO_GENERATED_END,
  AUTO_GENERATED_START,
  DesignToken,
  DesignTokenGroup,
  DesignTokenNode,
} from '../../src/public_api';
import type {
  ExtractTokenSchematicsSchema,
} from './schema';

const patternToDetect = 'o3r.var';

/**
 * Extract the token from o3r mixin sass file
 * @param options
 */
function extractTokenFn(options: ExtractTokenSchematicsSchema): Rule {
  const updateFileContent = (content: string): string => {
    const start = content.indexOf(patternToDetect);
    const end = content.lastIndexOf(patternToDetect);

    if (start === -1 || !options.includeTags) {
      return content;
    }

    const startTag = typeof options.includeTags === 'boolean' ? AUTO_GENERATED_START : options.includeTags.startTag;
    const endTag = typeof options.includeTags === 'boolean' ? AUTO_GENERATED_END : options.includeTags.endTag;
    const indexToInsertStart = content.substring(0, start).lastIndexOf('\n') + 1;
    const indexToInsertEnd = content.substring(end).indexOf('\n') + end + 1;

    return `${content.substring(0, indexToInsertStart)}${startTag}\n`
      + content.substring(indexToInsertStart, indexToInsertEnd)
      + `${endTag}\n${content.substring(indexToInsertEnd)}`;
  };

  return async (tree, context) => {
    try {
      const { CssVariableExtractor } = await import('@o3r/styling/builders/style-extractor/helpers');
      const { filter } = await import('minimatch');
      const filterFunctions = options.componentFilePatterns.map((pattern) => filter(
        '/' + pattern.replace(/[/\\]+/g, '/'),
        { dot: true }
      ));
      const sassParser = new CssVariableExtractor();

      tree.visit(async (file) => {
        if (!filterFunctions.some((filterFunction) => filterFunction(file))) {
          return;
        }
        const content = tree.readText(file);
        const variables = await sassParser.extractFileContent(resolve(tree.root.path, file), content);

        if (variables.length > 0 && options.includeTags) {
          const newContent = updateFileContent(content);
          tree.overwrite(file, newContent);
        }

        const isPrivate = file.endsWith('theme.scss');
        const tokenSpecification = variables
          .reduce((node, variable) => {
            const nameSplit = variable.name.split('-');
            const namePath = options.flattenLevel === undefined
              ? nameSplit
              : [...nameSplit.slice(0, options.flattenLevel), nameSplit.slice(options.flattenLevel).join('.')].filter((item) => !!item);
            let targetNode: DesignTokenGroup | DesignToken = node;
            namePath.forEach((name) => {
              (targetNode as DesignTokenGroup)[name] ||= {};
              targetNode = (targetNode as DesignTokenGroup)[name] as DesignTokenGroup | DesignToken;
            });

            const valueWithVariable = [...variable.defaultValue.matchAll(/var\(--([^),]+),?[^)]*\)/g)]
              .reduce((acc, [variableString, variableName]) => {
                return acc.replaceAll(variableString, `{${variableName.replaceAll('-', '.')}}`);
              }, variable.defaultValue);

            const targetNodeValue = targetNode as any as DesignToken;
            targetNodeValue.$description = variable.description;
            targetNodeValue.$type = !variable.type || variable.type === 'string'
              ? (Number.isNaN(+variable.defaultValue) ? undefined : 'number')
              : variable.type;
            targetNodeValue.$value = targetNodeValue.$type === 'number'
              ? +variable.defaultValue
              : valueWithVariable;
            targetNodeValue.$extensions ||= {};
            targetNodeValue.$extensions.o3rMetadata ||= {};
            targetNodeValue.$extensions.o3rMetadata.category = variable.category;
            targetNodeValue.$extensions.o3rMetadata.label = variable.label;
            targetNodeValue.$extensions.o3rMetadata.tags = variable.tags;
            return node;
          }, {} as DesignTokenGroup | DesignToken);

        Object.values(tokenSpecification)
          .forEach((node) => {
            const designTokenNode = node as DesignTokenNode;
            designTokenNode.$extensions ||= {};
            designTokenNode.$extensions.o3rPrivate = isPrivate;
            designTokenNode.$extensions.o3rTargetFile = posix.join('.', posix.basename(file));
          });
        (tokenSpecification as any).$schema = 'https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/@o3r/design/schemas/design-token.schema.json';
        tree.create(file.replace(/\.scss$/, '.json'), JSON.stringify(tokenSpecification, null, 2));
      });
      return () => tree;
    } catch (e) {
      context.logger.warn('The following dependencies should be provided to the extract-token schematics: "@o3r/styling", "minimatch".');
      context.logger.warn('The extraction will stop, it can be re-run with the schematic "@o3r/design:extract-token".');
      context.logger.debug(JSON.stringify(e));
    }
  };
}

/**
 * Extract the token from o3r mixin sass file
 * @param options
 */
export const extractToken = (options: ExtractTokenSchematicsSchema) => async () => {
  let createOtterSchematicWrapper: typeof createOtterSchematic = (fn) => fn;
  try {
    const {
      createOtterSchematic: wrapper
    } = await import('@o3r/schematics');
    createOtterSchematicWrapper = wrapper;
  } catch {
    // No @o3r/schematics detected
  }
  return createOtterSchematicWrapper(extractTokenFn)(options);
};
