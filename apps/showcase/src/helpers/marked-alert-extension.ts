import {
  type MarkedExtension,
  type Tokens,
} from 'marked';

const variants = ['note', 'tip', 'important', 'warning', 'caution'];
const cssVariantMapping: Record<string, string> = {
  note: 'info',
  tip: 'tip',
  important: 'info',
  warning: 'warning',
  caution: 'danger'
};
const iconVariantMapping: Record<string, string> = {
  note: 'fa-info-circle',
  tip: 'fa-lightbulb',
  important: 'fa-info-circle',
  warning: 'fa-exclamation-triangle',
  caution: 'fa-minus-circle'
};
function createSyntaxPattern(type: string) {
  return `^(?:\\[!${type.toUpperCase()}])\\s*?\n*`;
}
function ucfirst(str: string) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Marked extension to support GitHub like alerts
 * Forked from https://github.com/bent10/marked-extensions/tree/main/packages/alert to match Design Factory
 */
export function markedAlert(): MarkedExtension {
  return {
    walkTokens: (token) => {
      if (token.type !== 'blockquote') {
        return;
      }

      const matchedVariant = variants.find((type) =>
        new RegExp(createSyntaxPattern(type)).test(token.text)
      );

      if (matchedVariant) {
        const typeRegexp = new RegExp(createSyntaxPattern(matchedVariant));

        Object.assign(token, {
          type: 'alert',
          meta: {
            className: `alert alert-${cssVariantMapping[matchedVariant]}`,
            variant: matchedVariant,
            icon: iconVariantMapping[matchedVariant]
          }
        });

        const firstLine = token.tokens?.[0] as Tokens.Paragraph;
        const firstLineText = firstLine.raw?.replace(typeRegexp, '').trim();

        if (firstLineText) {
          const patternToken = firstLine.tokens[0] as Tokens.Text;

          Object.assign(patternToken, {
            raw: patternToken.raw.replace(typeRegexp, ''),
            text: patternToken.text.replace(typeRegexp, '')
          });

          if (firstLine.tokens[1]?.type === 'br') {
            firstLine.tokens.splice(1, 1);
          }
        } else {
          token.tokens?.shift();
        }
      }
    },
    extensions: [
      {
        name: 'alert',
        level: 'block',
        renderer({ meta, tokens = [] }) {
          let tmpl = `<div dfInsertAlertIcon class="${meta.className} ${meta.className}-${meta.variant}">\n`;
          tmpl += `<p class="${meta.titleClassName}">`;
          tmpl += `<span class="df-insert-icon ${meta.icon}"></span>`;
          tmpl += `<strong>${ucfirst(meta.variant)}</strong>`;
          tmpl += '</p>\n';
          tmpl += this.parser.parse(tokens);
          tmpl += '</div>\n';

          return tmpl;
        }
      }
    ]
  };
}
