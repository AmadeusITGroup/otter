import type {
  DesignTokenGroupTemplate,
} from '../..';
import {
  mergeDesignTokenTemplates,
} from './design-token-template.helpers';

describe('mergeDesignTokenTemplates function', () => {
  it('should merge object', () => {
    const templateA: DesignTokenGroupTemplate = {
      field1: {
        field2: {
          $extensions: {
            o3rPrivate: true
          }
        }
      } as DesignTokenGroupTemplate
    };

    const templateB: DesignTokenGroupTemplate = {
      field1: {
        field3: {
          $extensions: {
            o3rPrivate: false
          }
        }
      } as DesignTokenGroupTemplate
    };

    const result: any = mergeDesignTokenTemplates(templateA, templateB);
    expect(result.field1.field2).toBeDefined();
    expect(result.field1.field3).toBeDefined();
    expect(result.field1.field2.$extensions.o3rPrivate).toBe(true);
    expect(result.field1.field3.$extensions.o3rPrivate).toBe(false);
  });

  it('should override data in case on config', () => {
    const templateA: DesignTokenGroupTemplate = {
      field1: {
        field2: {
          $extensions: {
            o3rPrivate: true
          }
        }
      } as DesignTokenGroupTemplate
    };

    const templateB: DesignTokenGroupTemplate = {
      field1: {
        field2: {
          $extensions: {
            o3rPrivate: false
          }
        }
      } as DesignTokenGroupTemplate
    };

    const result: any = mergeDesignTokenTemplates(templateA, templateB);
    expect(result.field1.field2).toBeDefined();
    expect(result.field1.field2.$extensions.o3rPrivate).toBe(false);
  });
});
