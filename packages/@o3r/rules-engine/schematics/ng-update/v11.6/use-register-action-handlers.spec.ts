import {
  callRule,
  type SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  lastValueFrom,
} from 'rxjs';
import {
  useRegisterActionHandlers,
} from './use-register-action-handlers';

let initialTree: Tree;
let tree: Tree;
const untouchedFile = 'untouchedFile.ts';
const fileWithActionHandlerAdd = 'fileWithActionHandlerAdd.ts';
const fileWithActionHandlerDelete = 'fileWithActionHandlerDelete.ts';
const multiplePresenceFile = 'multiplePresence.ts';

describe('useRegisterActionHandlers', () => {
  beforeEach(() => {
    initialTree = Tree.empty();
  });

  it('should not touch files without references', async () => {
    initialTree.create(untouchedFile, 'export {};');
    tree = await lastValueFrom(callRule(useRegisterActionHandlers, initialTree, {} as SchematicContext));
    expect(tree.readText(untouchedFile)).toBe(initialTree.readText(untouchedFile));
  });

  it('should change file with a reference to actionHandlers.add', async () => {
    initialTree.create(fileWithActionHandlerAdd, `
      import {inject, runInInjectionContext} from '@angular/core';
      import {RulesEngineRunnerService} from '@o3r/rules-engine';
      import {appConfig} from './app/app.config';
      import {AppComponent} from './app/app.component';
      import {PopupActionHandler} from './services/popup-action-handler';

      bootstrapApplication(AppComponent, appConfig)
        .then((m) => {
          runInInjectionContext(m.injector, () => {
            inject(RulesEngineRunnerService);
            ruleEngine.actionHandlers.add(inject(PopupActionHandler));
          });
        })
        // eslint-disable-next-line no-console
        .catch(err => console.error(err));
    `);
    tree = await lastValueFrom(callRule(useRegisterActionHandlers, initialTree, {} as SchematicContext));
    expect(tree.readText(fileWithActionHandlerAdd)).not.toContain('actionHandlers.add');
    expect(tree.readText(fileWithActionHandlerAdd)).toContain('ruleEngine.registerActionHandlers(inject(PopupActionHandler))');
  });

  it('should change file with a reference to actionHandlers.delete', async () => {
    initialTree.create(fileWithActionHandlerDelete, `
      import {inject, runInInjectionContext} from '@angular/core';
      import {RulesEngineRunnerService} from '@o3r/rules-engine';
      import {appConfig} from './app/app.config';
      import {AppComponent} from './app/app.component';
      import {PopupActionHandler} from './services/popup-action-handler';

      bootstrapApplication(AppComponent, appConfig)
        .then((m) => {
          runInInjectionContext(m.injector, () => {
            inject(RulesEngineRunnerService);
            ruleEngine.actionHandlers.delete(inject(PopupActionHandler));
          });
        })
        // eslint-disable-next-line no-console
        .catch(err => console.error(err));
    `);
    tree = await lastValueFrom(callRule(useRegisterActionHandlers, initialTree, {} as SchematicContext));
    expect(tree.readText(fileWithActionHandlerDelete)).not.toContain('actionHandlers.delete');
    expect(tree.readText(fileWithActionHandlerDelete)).toContain('ruleEngine.unregisterActionHandlers(inject(PopupActionHandler))');
  });

  it('should change file with multiple reference', async () => {
    initialTree.create(multiplePresenceFile, `
      import {inject, runInInjectionContext} from '@angular/core';
      import {RulesEngineRunnerService} from '@o3r/rules-engine';
      import {ConfigurationRulesEngineActionHandler} from '@o3r/configuration/rules-engine';
      import {appConfig} from './app/app.config';
      import {AppComponent} from './app/app.component';
      import {PopupActionHandler} from './services/popup-action-handler';

      bootstrapApplication(AppComponent, appConfig)
        .then((m) => {
          runInInjectionContext(m.injector, () => {
            inject(RulesEngineRunnerService);
            ruleEngine.actionHandlers.add(inject(PopupActionHandler));
            ruleEngine.actionHandlers.add(inject(ConfigurationRulesEngineActionHandler));
            ruleEngine.actionHandlers.delete(inject(PopupActionHandler));
            ruleEngine.actionHandlers.delete(inject(ConfigurationRulesEngineActionHandler));
          });
        })
        // eslint-disable-next-line no-console
        .catch(err => console.error(err));
    `);
    tree = await lastValueFrom(callRule(useRegisterActionHandlers, initialTree, {} as SchematicContext));
    const text = tree.readText(multiplePresenceFile);
    expect(text).not.toContain('actionHandlers.add');
    expect(tree.readText(multiplePresenceFile)).toContain('ruleEngine.registerActionHandlers(inject(PopupActionHandler))');
    expect(tree.readText(multiplePresenceFile)).toContain('ruleEngine.registerActionHandlers(inject(ConfigurationRulesEngineActionHandler))');
    expect(text).not.toContain('actionHandlers.delete');
    expect(tree.readText(multiplePresenceFile)).toContain('ruleEngine.unregisterActionHandlers(inject(PopupActionHandler))');
    expect(tree.readText(multiplePresenceFile)).toContain('ruleEngine.unregisterActionHandlers(inject(ConfigurationRulesEngineActionHandler))');
  });
});
