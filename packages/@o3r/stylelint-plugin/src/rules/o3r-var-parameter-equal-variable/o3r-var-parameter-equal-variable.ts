import type * as PostCSS from 'postcss';
import { PluginContext, PostcssResult, Problem, utils } from 'stylelint';
import { getNamespacedRuleName } from '../../utils/get-namespaced-rule-name';

const o3rImportRegexp = new RegExp(/^@use ['"]@o3r\/styling['"] as (.*);/m);
/**
 * Scoped rule name
 */
export const ruleName = getNamespacedRuleName('o3r-var-parameter-equal-variable');

/**
 * Contains expected function which is used to log issues
 */
export const messages = utils.ruleMessages(ruleName, {
  expected: (parameter: string, variableName: string, alias: string) => `${alias}.variable parameter doesn't match variable name: "${parameter}" vs "${variableName}"`
});

/** Logs the error message when there is no good o3r styling alias for variable declaration */
export const messagesAlias = utils.ruleMessages(ruleName, {
  expected: (alias: string, declarationValue: string) => `.variable not used with the good alias = ${alias} in ${declarationValue}`
});

/**
 * The rule which will be given to stylelint.createPlugin method.
 *
 * @param primary
 * @param _secondaryOptions
 * @param context
 */
export const rule = (primary: any, _secondaryOptions: Record<string, any>, context: PluginContext) => {
  return (root: PostCSS.Root, result: PostcssResult) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary
    });

    if (!validOptions) {
      return;
    }

    const match = root.source?.input.css.match(o3rImportRegexp);

    if (match && match[1]) {
      const alias = match[1];
      const parameterRegexp = new RegExp(`${alias}.variable\\s*\\([\\s\n]*['"](?<parameter>.*?)['"]`);

      const isAutoFixing = context.fix;
      root.walkDecls((decl: PostCSS.Declaration) => {
        if (decl.value.indexOf('.variable') === -1) {
          return; // Nothing to do with this node - continue
        }

        const variableName = decl.prop.replace('$', ''); // Remove beginning $ from the variable name
        const regexResult = parameterRegexp.exec(decl.value);
        const parameter = regexResult?.groups?.parameter ?? '';

        if (!parameter) {
          utils.report({
            ruleName,
            result: result,
            message: messagesAlias.expected(alias, decl.value), // Build the reported message
            node: decl as PostCSS.Node, // Specify the reported node
            word: decl.value
          } as Problem);
        } else if (parameter !== variableName) {
          if (isAutoFixing) { // We are in “fix” mode
            decl.value = decl.value.replace(parameter, variableName);
          } else { // We are in “report only” mode
            utils.report({
              ruleName,
              result: result,
              message: messages.expected(parameter, variableName, alias), // Build the reported message
              node: decl as PostCSS.Node, // Specify the reported node
              word: parameter // Which exact word caused the error? This positions the error properly
            } as Problem);
          }
        }
      });
    }
  };
};
