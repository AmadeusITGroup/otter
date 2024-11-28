import * as fs from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  callRule,
  Tree,
} from '@angular-devkit/schematics';
import type {
  CssVariable,
} from '@o3r/styling';
import {
  validate,
} from 'jsonschema';
import {
  firstValueFrom,
} from 'rxjs';
import {
  extractToken,
} from './index';

describe('Extract Token schematic', () => {
  let initialTree: Tree;

  const initialSassFile = `
@use '@o3r/styling' as o3r;

$breadcrumb-pres-item-icon-size: o3r.variable('breadcrumb-pres-item-icon-size', 3rem);
$breadcrumb-pres-item-icon-color: o3r.variable('breadcrumb-pres-item-icon-color', #fff);
$breadcrumb-pres-item-other-color: o3r.variable('breadcrumb-pres-item-other-color', o3r.var('breadcrumb-pres-item-icon-color'));

// other CSS
.test {
  color: $breadcrumb-pres-item-other-color;
}`;

  beforeAll(() => {
    jest.mock('@o3r/styling/builders/style-extractor/helpers', () => ({
      CssVariableExtractor: class {
        public extractFileContent = jest.fn<CssVariable[], any>().mockReturnValue([
          {
            defaultValue: '3rem',
            name: 'breadcrumb-pres-item-icon-size',
            label: 'breadcrumb pres item icon size',
            type: 'string'
          },
          {
            defaultValue: '#000',
            name: 'breadcrumb-pres-item-icon-color-bg',
            label: 'breadcrumb pres item icon color background',
            type: 'color'
          },
          {
            defaultValue: '#fff',
            name: 'breadcrumb-pres-item-icon-color',
            label: 'breadcrumb pres item icon color',
            type: 'color'
          },
          {
            defaultValue: 'var(--breadcrumb-pres-item-icon-color)',
            name: 'breadcrumb-pres-item-other-color',
            label: 'breadcrumb pres item other color',
            type: 'string'
          }
        ]);

        constructor() {}
      }
    }));
  });

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('src/component/my-comp.theme.css', 'should be ignored');
    initialTree.create('src/component/my-comp.theme.scss', initialSassFile);
  });

  it('should correctly extract the Design Token', async () => {
    const logger = { warn: jest.fn(), debug: jest.fn() };
    const tree = await firstValueFrom(callRule(extractToken({
      includeTags: false,
      componentFilePatterns: ['src/component/**.*scss']
    }), initialTree, { logger } as any));

    expect(tree.exists('src/component/my-comp.theme.json')).toBe(true);
    expect(validate(tree.readText('src/component/my-comp.theme.json'), fs.readFileSync(resolve(__dirname, '../../schemas/design-token.schema.json'))).errors).toHaveLength(0);
    expect(tree.readText('src/component/my-comp.theme.scss')).toBe(initialSassFile);
  });

  it('should extract the Design Token with right flatten level', async () => {
    const logger = { warn: jest.fn(), debug: jest.fn() };

    let tree = await firstValueFrom(callRule(extractToken({
      includeTags: false,
      componentFilePatterns: ['src/component/**.*scss'],
      flattenLevel: 1
    }), initialTree, { logger } as any));

    const resultLevel1 = tree.readJson('src/component/my-comp.theme.json') as any;
    tree.delete('src/component/my-comp.theme.json');

    tree = await firstValueFrom(callRule(extractToken({
      includeTags: false,
      componentFilePatterns: ['src/component/**.*scss'],
      flattenLevel: 2
    }), initialTree, { logger } as any));

    const resultLevel2 = tree.readJson('src/component/my-comp.theme.json') as any;
    tree.delete('src/component/my-comp.theme.json');

    tree = await firstValueFrom(callRule(extractToken({
      includeTags: false,
      componentFilePatterns: ['src/component/**.*scss'],
      flattenLevel: 10
    }), initialTree, { logger } as any));

    const resultLevel10 = tree.readJson('src/component/my-comp.theme.json') as any;

    expect(resultLevel1.breadcrumb['pres.item.icon.color']).toBeDefined();
    expect(resultLevel1.breadcrumb['pres.item.icon.color.bg']).toBeDefined();
    expect(resultLevel1.breadcrumb.pres).not.toBeDefined();
    expect(resultLevel2.breadcrumb['pres.item.icon.color']).not.toBeDefined();
    expect(resultLevel2.breadcrumb['pres.item.icon.color.bg']).not.toBeDefined();
    expect(resultLevel2.breadcrumb.pres).toBeDefined();
    expect(resultLevel10.breadcrumb.pres.item.icon.color).toBeDefined();
    expect(resultLevel10.breadcrumb.pres.item.icon.color.$value).toEqual(resultLevel1.breadcrumb['pres.item.icon.color'].$value);
    expect(resultLevel10.breadcrumb.pres.item.icon.color.bg).toBeDefined();
    expect(resultLevel10.breadcrumb.pres.item.icon.color.bg.$value).toEqual(resultLevel1.breadcrumb['pres.item.icon.color.bg'].$value);
  });

  it('should Update the original file', async () => {
    const logger = { warn: jest.fn(), debug: jest.fn() };
    const tree = await firstValueFrom(callRule(extractToken({
      includeTags: true,
      componentFilePatterns: ['src/component/**.*scss']
    }), initialTree, { logger } as any));

    expect(tree.readText('src/component/my-comp.theme.scss')).not.toBe(initialSassFile);
    expect(tree.readText('src/component/my-comp.theme.scss')).toBe(`
@use '@o3r/styling' as o3r;

/* --- BEGIN THEME Auto-generated --- */
$breadcrumb-pres-item-icon-size: o3r.variable('breadcrumb-pres-item-icon-size', 3rem);
$breadcrumb-pres-item-icon-color: o3r.variable('breadcrumb-pres-item-icon-color', #fff);
$breadcrumb-pres-item-other-color: o3r.variable('breadcrumb-pres-item-other-color', o3r.var('breadcrumb-pres-item-icon-color'));
/* --- END THEME Auto-generated --- */

// other CSS
.test {
  color: $breadcrumb-pres-item-other-color;
}`
    );
  });
});
