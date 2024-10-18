import {
  callRule,
  Tree
} from '@angular-devkit/schematics';
import {
  lastValueFrom
} from 'rxjs';
import {
  injectServiceInMain
} from './devtools-registration';

const projectName = 'projectName';
const mainFilePath = 'main.ts';
const fakeContext = { logger: { debug: jest.fn() } } as any;

describe('Devtools Registration', () => {
  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create(mainFilePath, `
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
    `);
    initialTree.create('angular.json', JSON.stringify({ projects: { [projectName]: { architect: { build: { options: { main: mainFilePath } } } } } }));
  });

  it('should inject service in the main file', async () => {
    const serviceName = 'ServiceName';
    const tree = await lastValueFrom(
      callRule(
        injectServiceInMain({
          moduleName: 'ModuleName',
          packageName: '@scope/package-name',
          projectName,
          serviceName
        }),
        initialTree,
        fakeContext
      )
    );
    expect(tree.readText(mainFilePath)).toContain(`.then((m) => { runInInjectionContext(m.injector, () => { inject(${serviceName}); }); return m; })`);
  });

  it('should inject a service if `bootstrapApplication` found', async () => {
    const serviceName = 'ServiceName';
    initialTree.overwrite(mainFilePath, `
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
    `);
    const tree = await lastValueFrom(
      callRule(
        injectServiceInMain({
          moduleName: 'ModuleName',
          packageName: '@scope/package-name',
          projectName,
          serviceName
        }),
        initialTree,
        fakeContext
      )
    );
    expect(tree.readText(mainFilePath)).toContain(`.then((m) => { runInInjectionContext(m.injector, () => { inject(${serviceName}); }); return m; })`);
  });

  it('should not reinject a service', async () => {
    const serviceName = 'ServiceName';
    const treeFirstAdd = await lastValueFrom(
      callRule(
        injectServiceInMain({
          moduleName: 'ModuleName',
          packageName: '@scope/package-name',
          projectName,
          serviceName
        }),
        initialTree,
        fakeContext
      )
    );
    const treeSecondAdd = await lastValueFrom(
      callRule(
        injectServiceInMain({
          moduleName: 'ModuleName',
          packageName: '@scope/package-name',
          projectName,
          serviceName
        }),
        treeFirstAdd,
        fakeContext
      )
    );
    expect(Array.from(treeSecondAdd.readText(mainFilePath).matchAll(/inject\(\w+\)/g)).length).toBe(1);
  });

  it('should not inject a service if no name provided', async () => {
    const tree = await lastValueFrom(
      callRule(
        injectServiceInMain({
          moduleName: 'ModuleName',
          packageName: '@scope/package-name',
          projectName,
          serviceName: undefined
        }),
        initialTree,
        fakeContext
      )
    );
    expect(tree.readText(mainFilePath)).not.toContain('inject');
  });

  it('should not inject a service if no main file found', async () => {
    const tree = await lastValueFrom(
      callRule(
        injectServiceInMain({
          moduleName: 'ModuleName',
          packageName: '@scope/package-name',
          projectName: undefined,
          serviceName: 'ServiceName'
        }),
        initialTree,
        fakeContext
      )
    );
    expect(tree.readText(mainFilePath)).not.toContain('inject');
  });

  it('should not inject a service if no `bootstrapModule` found', async () => {
    initialTree.overwrite(mainFilePath, '');
    const tree = await lastValueFrom(
      callRule(
        injectServiceInMain({
          moduleName: 'ModuleName',
          packageName: '@scope/package-name',
          projectName,
          serviceName: 'ServiceName'
        }),
        initialTree,
        fakeContext
      )
    );
    expect(tree.readText(mainFilePath)).not.toContain('inject');
  });
});
