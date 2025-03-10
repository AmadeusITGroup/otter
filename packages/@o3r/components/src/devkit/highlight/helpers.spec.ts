import {
  getIdentifier,
} from './helpers';
import {
  ElementWithGroupInfo,
} from './models';

describe('Highlight helpers', () => {
  describe('getIdentifier', () => {
    it('should return the tagName', () => {
      const element = {
        htmlElement: {
          tagName: 'prefix-selector'
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-selector');
    });

    it('should return the first attributeName matching', () => {
      const element = {
        htmlElement: {
          tagName: 'custom-selector',
          attributes: [
            { name: 'custom-attribute' },
            { name: 'prefix-attribute' },
            { name: 'prefix-attribute-2' }
          ] as any as NamedNodeMap
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-attribute');
    });

    it('should return the first attributeName matching with its value', () => {
      const element = {
        htmlElement: {
          tagName: 'custom-selector',
          attributes: [{ name: 'prefix-attribute', value: 'value' }] as any as NamedNodeMap
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-attribute="value"');
    });

    it('should return the first className matching', () => {
      const element = {
        htmlElement: {
          tagName: 'custom-selector',
          attributes: [] as any as NamedNodeMap,
          classList: ['custom-class', 'prefix-class', 'prefix-class-2'] as any as DOMTokenList
        } as HTMLElement,
        regexp: '^prefix',
        backgroundColor: 'blue',
        displayName: 'prefix'
      } satisfies ElementWithGroupInfo;
      expect(getIdentifier(element)).toBe('prefix-class');
    });
  });
});
