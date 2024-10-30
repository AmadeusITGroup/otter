import type {
  WorkspaceSchema
} from '../interfaces';
import {
  getSchematicOptions
} from './collection';

const angularJsonGenericNgAdd: WorkspaceSchema = {
  projects: {},
  version: 1,
  schematics: { '@o3r/components:component': { path: '' },
    '@o3r/services:service': { path: '' },
    '@o3r/store:store': { path: '' },
    '@o3r/core:schematics': { path: '' },
    '*:ng-add': { enableMetadataExtract: true } as any,
    '*:*': { libsDir: 'libs', appsDir: 'apps' }
  } as any
};

const angularJsonSpecificNgAdd: WorkspaceSchema = {
  projects: {},
  version: 1,
  schematics: { '@o3r/components:component': { path: '' },
    '@o3r/services:service': { path: '' },
    '@o3r/store:store': { path: '' },
    '@o3r/core:schematics': { path: '' },
    '@o3r/core:ng-add': { projectName: 'otter' },
    '*:ng-add': { enableMetadataExtract: true },
    '*:*': { libsDir: 'libs', appsDir: 'apps', testFramework: 'jest' }
  } as any
};

const angularJsonNoGeneric: WorkspaceSchema = {
  projects: {},
  version: 1,
  schematics: { '@o3r/components:component': { path: '' },
    '@o3r/services:service': { path: '' },
    '@o3r/store:store': { path: '' },
    '@o3r/core:schematics': { path: '' },
    '@o3r/core:ng-add': { projectName: 'otter' },
    '*:ng-add': { enableMetadataExtract: true }
  } as any
};

const createFakeContext = (collection: string, name: string): any => ({
  schematic: {
    description: {
      collection: {
        name: collection
      },
      name
    }
  }
});

describe('Get schematics options', () => {
  it('should return the ng-add generic options followed by overall generic options', () => {
    const options = getSchematicOptions(angularJsonGenericNgAdd, createFakeContext('@o3r/core', 'ng-add'));
    expect(Object.keys(options)[0]).toBe('enableMetadataExtract');
    expect(Object.keys(options)[1]).toBe('libsDir');
    expect(Object.keys(options).length).toBe(3);
  });

  it('should return the generic options when no matches for schematics name', () => {
    const options = getSchematicOptions(angularJsonGenericNgAdd, createFakeContext('@o3r/core', 'dummy'));
    expect(options).toEqual(angularJsonGenericNgAdd.schematics['*:*']);
  });

  it('should return the specific o3r/core ng add, followed by ng-add generic options, followed by overall generic options', () => {
    const options = getSchematicOptions(angularJsonSpecificNgAdd, createFakeContext('@o3r/core', 'ng-add'));
    expect(Object.keys(options)[0]).toBe('projectName');
    expect(Object.keys(options)[1]).toBe('enableMetadataExtract');
    expect(Object.keys(options)[2]).toBe('libsDir');
    expect(Object.keys(options)[3]).toBe('appsDir');
    expect(Object.keys(options)[4]).toBe('testFramework');

    expect(Object.keys(options).length).toBe(5);
  });

  it('should return closest matching when no generic options present', () => {
    const options = getSchematicOptions(angularJsonNoGeneric, createFakeContext('@o3r/core', 'ng-add'));
    expect(Object.keys(options)[0]).toBe('projectName');
    expect(Object.keys(options)[1]).toBe('enableMetadataExtract');
    expect(Object.keys(options).length).toBe(2);
  });

  it('should return undefined when no generic options present and no matching', () => {
    const options = getSchematicOptions(angularJsonNoGeneric, createFakeContext('@o3r/core', 'dummy'));
    expect(options).toBeUndefined();
  });
});
