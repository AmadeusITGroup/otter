import type {
  DesignTokenGroupExtensions,
  DesignTokenGroupTemplate,
} from '../design-token-specification.interface';

/**
 * Merge TemplateB into TemplateA
 * @param templateA
 * @param templateB
 */
export const mergeDesignTokenTemplates = <
  A extends DesignTokenGroupExtensions = DesignTokenGroupExtensions,
  B extends DesignTokenGroupExtensions = DesignTokenGroupExtensions>
(templateA: DesignTokenGroupTemplate<A>, templateB: DesignTokenGroupTemplate<B>): DesignTokenGroupTemplate<A | B> => {
  const entries = Object.entries(templateB);
  const template = {
    ...templateA,
    ...Object.fromEntries(
      entries
        .filter(([key]) => key.startsWith('$'))
    )
  };

  return entries
    .filter(([key]) => !key.startsWith('$'))
    .reduce((acc, [key, value]) => {
      const node = acc[key];
      acc[key] = node && typeof node === 'object' && typeof value === 'object' ? mergeDesignTokenTemplates(node as DesignTokenGroupTemplate<A | B>, value as DesignTokenGroupTemplate<B>) : value;
      return acc;
    }, template as DesignTokenGroupTemplate<A | B>);
};
