/* eslint-disable @typescript-eslint/naming-convention */
import type { WorkspaceSchema } from '../interfaces';
import {getSchematicOptions} from './collection';

const angularJsonGenericNgAdd: WorkspaceSchema = {
  projects: {},
  version: 1,
  schematics: { '@o3r/components:component': { path: '' },
    '@o3r/services:service': {path: ''},
    '@o3r/store:store': {path: ''},
    '@o3r/core:schematics': {path: ''},
    '*:ng-add': { enableMetadataExtract: true },
    '*:*': {libsDir: 'libs', appsDir: 'apps'}
  }
};

const angularJsonSpecificNgAdd: WorkspaceSchema = {
  projects: {},
  version: 1,
  schematics: { '@o3r/components:component': { path: '' },
    '@o3r/services:service': {path: ''},
    '@o3r/store:store': {path: ''},
    '@o3r/core:schematics': {path: ''},
    '@o3r/core:ng-add': {projectName: 'otter'},
    '*:ng-add': { enableMetadataExtract: true },
    '*:*': {libsDir: 'libs', appsDir: 'apps'}
  }
};

const angularJsonNoGeneric: WorkspaceSchema = {
  projects: {},
  version: 1,
  schematics: { '@o3r/components:component': { path: '' },
    '@o3r/services:service': {path: ''},
    '@o3r/store:store': {path: ''},
    '@o3r/core:schematics': {path: ''},
    '@o3r/core:ng-add': {projectName: 'otter'},
    '*:ng-add': { enableMetadataExtract: true }
  }
};

describe('Get schematics options', () => {

  it('should return the ng-add generic options followed by overall generic options', () => {
    const options = getSchematicOptions(angularJsonGenericNgAdd, '@o3r/core:ng-add');
    expect(Object.keys(options)[0]).toBe('enableMetadataExtract');
    expect(Object.keys(options)[1]).toBe('libsDir');
    expect(Object.keys(options).length).toBe(3);
  });

  it('should return the generic options when no schematics name given', () => {
    const options = getSchematicOptions(angularJsonGenericNgAdd);
    expect(Object.keys(options)[0]).toBe('libsDir');
    expect(Object.keys(options).length).toBe(2);
  });

  it('should return undefined when no matches for schematics name', () => {
    const options = getSchematicOptions(angularJsonGenericNgAdd, 'dummy');
    expect(options).toBeUndefined();
  });

  it('should return the specific o3r/core ng add, followed by ng-add generic options, followed by overall generic options', () => {
    const options = getSchematicOptions(angularJsonSpecificNgAdd, '@o3r/core:ng-add');
    expect(Object.keys(options)[0]).toBe('projectName');
    expect(Object.keys(options)[1]).toBe('enableMetadataExtract');
    expect(Object.keys(options)[2]).toBe('libsDir');
    expect(Object.keys(options).length).toBe(4);
  });

  it('should return undefined when no schematics name given and no generic options present', () => {
    const options = getSchematicOptions(angularJsonNoGeneric);
    expect(options).toBeUndefined();
  });

});
