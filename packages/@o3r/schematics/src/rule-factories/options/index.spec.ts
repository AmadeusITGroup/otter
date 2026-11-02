import {
  callRule,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  lastValueFrom,
} from 'rxjs';
import {
  createSchematicWithOptionsFromWorkspace,
} from './index';

let context: SchematicContext;

describe('createSchematicWithOptionsFromWorkspaceIfInstalled', () => {
  beforeEach(() => {
    context = {
      schematic: {
        description: {
          collection: {
            name: 'MyCollection'
          },
          name: 'MySchematic'
        }
      },
      interactive: false
    } as any as SchematicContext;
  });

  it('should call the original schematic with the options', async () => {
    const rule = jest.fn((tree: Tree) => tree);

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
    const options = {
      example: 'test'
    };
    await lastValueFrom(callRule(schematic(options), Tree.empty(), context));
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(expect.objectContaining(options));
    expect(rule).toHaveBeenCalled();
  });

  it('should call the original schematic with the merge of the options + the options from the angular.json', async () => {
    const initialTree = Tree.empty();
    initialTree.create('angular.json', JSON.stringify({
      schematics: {
        '*:*': {
          commonWithValue: 'default',
          workspace: 'workspace',
          commonWithUndefined: 'definedValue'
        }
      }
    }, null, 2));
    const rule = jest.fn((tree: Tree) => tree);

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
    const options: any = {
      commonWithValue: 'test',
      option: 'option',
      commonWithUndefined: undefined
    };
    await lastValueFrom(callRule(schematic(options), initialTree, context));
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(expect.objectContaining({
      commonWithValue: 'test',
      workspace: 'workspace',
      option: 'option',
      commonWithUndefined: 'definedValue'
    }));
    expect(rule).toHaveBeenCalled();
  });

  it('should works if we chain schematic wrapper', async () => {
    const rule = jest.fn((tree: Tree) => tree);

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const noopSchematicWrapper = (schematicFn: (_opts: any) => Rule) => (opts: any): Rule => schematicFn(opts);
    const schematic = noopSchematicWrapper(createSchematicWithOptionsFromWorkspace(originalSchematic));
    const options = {
      example: 'test'
    };
    await lastValueFrom(callRule(schematic(options), Tree.empty(), context));
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(expect.objectContaining(options));
    expect(rule).toHaveBeenCalled();
  });

  it('should throw the original error', async () => {
    const error = new Error('error example');
    const rule = jest.fn(() => {
      throw error;
    });

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
    const options = {
      example: 'test'
    };
    await expect(lastValueFrom(callRule(schematic(options), Tree.empty(), context))).rejects.toThrow(error);
    expect(originalSchematic).toHaveBeenCalled();
    expect(originalSchematic).toHaveBeenCalledWith(expect.objectContaining(options));
    expect(rule).toHaveBeenCalled();
  });

  it('should throw if the rule is a rejected Promise', async () => {
    const rule = jest.fn(() => Promise.reject(new Error('rejected')));

    const originalSchematic = jest.fn((_opts: any): Rule => rule);
    const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
    const options = {
      example: 'test'
    };
    await expect(lastValueFrom(callRule(schematic(options), Tree.empty(), context))).rejects.toThrow();
  });

  describe('projectName default', () => {
    const createWorkspaceTree = (projects: Record<string, unknown>, extra: Record<string, unknown> = {}) => {
      const tree = Tree.empty();
      tree.create('angular.json', JSON.stringify({ version: 1, projects, ...extra }, null, 2));
      return tree;
    };

    beforeEach(() => {
      (context.schematic.description as any).schemaJson = { properties: { projectName: { type: 'string' } } };
    });

    it('should leave projectName undefined on a workspace without project', async () => {
      const originalSchematic = jest.fn((_opts: any): Rule => (tree: Tree) => tree);
      const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
      await lastValueFrom(callRule(schematic({ projectName: undefined } as any), createWorkspaceTree({}), context));
      expect(originalSchematic).toHaveBeenCalledWith(expect.not.objectContaining({ projectName: expect.anything() }));
    });

    it('should default projectName to the only project of the workspace and apply its schematics defaults', async () => {
      const originalSchematic = jest.fn((_opts: any): Rule => (tree: Tree) => tree);
      const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
      const initialTree = createWorkspaceTree({
        'my-app': { root: 'projects/my-app', schematics: { 'MyCollection:MySchematic': { fromProject: 'project' } } }
      });
      await lastValueFrom(callRule(schematic({ projectName: undefined } as any), initialTree, context));
      expect(originalSchematic).toHaveBeenCalledWith(expect.objectContaining({ projectName: 'my-app', fromProject: 'project' }));
    });

    it('should keep the explicitly provided projectName', async () => {
      const originalSchematic = jest.fn((_opts: any): Rule => (tree: Tree) => tree);
      const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
      const initialTree = createWorkspaceTree({ 'my-app': { root: 'projects/my-app' } });
      await lastValueFrom(callRule(schematic({ projectName: 'explicit' } as any), initialTree, context));
      expect(originalSchematic).toHaveBeenCalledWith(expect.objectContaining({ projectName: 'explicit' }));
    });

    it('should not set projectName when the schematic does not declare it', async () => {
      delete (context.schematic.description as any).schemaJson;
      const originalSchematic = jest.fn((_opts: any): Rule => (tree: Tree) => tree);
      const schematic = createSchematicWithOptionsFromWorkspace(originalSchematic);
      const initialTree = createWorkspaceTree({ 'my-app': { root: 'projects/my-app' } });
      await lastValueFrom(callRule(schematic({ example: 'test' } as any), initialTree, context));
      expect(originalSchematic.mock.calls[0][0]).not.toHaveProperty('projectName');
    });
  });
});
