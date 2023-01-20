# Rules engine - Integration in app

Rules engine module comes from __@o3r/rules-engine__ package and it contains all the mechanisms needed for an otter application to execute a set of UI rules (see more about rules in [rules-engine-core docs](../../rules-engine-core.md) ) and to trigger the resulted actions. The list of supported actions can be found in its own dedicated [file](https://github.com/AmadeusITGroup/otter/blob/main/packages/@o3r/rules-engine/src/interfaces/action.interfaces.ts).

Prerequisite:  

- an otter based application

## Steps

### Rules engine dependencies

To benefit from the rules engine package, we have to add in the application the npm packages created in otter library (and not only).  
Here is the command to add the rule engine to your application.

```shell
yarn add @o3r/rules-engine
```

### Angular modules integration

#### RulesEngineModule

* The first module to integrate is the _RulesEngineModule_.
This will be done in the application module.

```typescript
// app.module.ts
...
import { RulesEngineModule } from '@o3r/rules-engine';
...

@NgModule({
  imports: [
    ...
    RulesEngineModule
  ]
  ...
}
export class AppModule {}
```

#### Facts modules integration  

Facts are streams registered with the engine and their names can be referenced within rule conditions. At each fact change the concerned rules will reevaluate. More about facts can be found in the dedicated page for [facts](../../rules-engine-core/facts.md).

There are some default facts in rules-engine otter package (example purpose only!) which have been integrated in the demo app. As for the _RulesEngineModule_, the facts modules are registered in _app.module_.

```typescript
// app.module.ts
...
import { DeviceDetectionFactsModule, RulesEngineModule } from '@o3r/rules-engine';
...

@NgModule({
  imports: [
    ...
    RulesEngineModule.forRoot(),
    DeviceDetectionFactsModule,
  ]
  ...
}
export class AppModule {}
```

##### App level facts

As example purpose, custom facts have been defined in the otter-demo-app code, at application level, in a dedicated folder __src/facts__. You can have a look at the folder structure and files organization, and the implementation itself.  

In the _app.module_ we have integrated these facts modules, as we've done with the ones coming from the library.

```typescript
// app.module.ts
...
import { RulesEngineModule } from '@o3r/rules-engine';
import { DeviceDetectionFactsModule, PageFactsModule, SearchCriteriaFactsModule } from '../facts/index';
...

@NgModule({
  imports: [
    ...
    RulesEngineModule.forRoot(),
    SearchCriteriaFactsModule,
    PageFactsModule
  ]
  ...
}
export class AppModule {}
```

To sum up, in __app.module__ we should include the _RulesEngineModule_ and the facts modules needed at the bootstrap of the application. There might be facts needed for rules which are on demand, which could be included later on the flow. More about _on demand_ rulesets in the dedicated [page](./dedicated-component-ruleset.md).

### Facts registration and rulesets assimilation

In this part the facts has to be registered into the rules engine itself, and the set of rules has to be given to the same engine.
This is done in the __app.component.ts__ file, at the initialization of the component, via _RulesEngineService_.

```typescript
// app.component.ts
...
import { RulesEngineService, RulesetsStore, setRulesetsEntities } from '@o3r/rules-engine';
import { DeviceDetectionFactsService, PageFactsService, SearchCriteriaFactsService } from '../facts/index';
...

export class AppComponent implements OnInit, OnDestroy {
  ...
  constructor(
    ...
    private deviceDetectionFacts: DeviceDetectionFactsService,
    private searchCriteriaFacts: SearchCriteriaFactsService,
    private pageFacts: PageFactsService,
    private ruleEngine: RulesEngineService,
    private store: Store<RulesetsStore>
  ) {}

  public async ngOnInit() {
    ...
    this.deviceDetectionFacts.register(); // register example fact coming from Otter Framework
    this.searchCriteriaFacts.register(); // register app level custom fact

    // retrieve the set of rules to execute
    const rulesetsJsonPath = `${!environment.production ? 'assets/' : ''}rules/rulesets.json`;
    const resultCall = await fetch(this.dynamicContentService.getContentPath(rulesetsJsonPath));
    const result = await resultCall.json();
    // register the set of rules in rulesets store
    this.store.dispatch(setRulesetsEntities({entities: result.rulesets}));

    this.pageFacts.register(); // register a second custom fact (after the rules are registered)
  }
}
```

With this the application should be ready to retrieve and evaluate the rules, and execute the resulted actions.

### Metadata

A bit of configuration is needed in order to extract metadata for facts and operators in rules engine scope.

In _angular.json_ of the app a new build architect needs to be added.
Here is an example:  

```JSON
// angular.json
  ...
  "extract-rules-engine": {
    "builder": "@o3r/rules-engine:extractor", // otter cms adapters builder
    "options": {
      "tsConfig": "./tsconfig.cms.json", // ts config file used by the builder
      "libraries": [ // libraries containing facts included in the app
        "@o3r/rules-engine"
      ],
      "factFilePatterns": [ // custom facts files
        "src/facts/**/*.facts.ts"
      ]
    }
  },
```

Now that the new builder step is added, it has to be referenced in `package.json` file, alongside other metadata extraction scripts.

```JSON
// package.json
...
  "scripts": {
    ...
    "cms-adapters:rules-engine": "ng run o3r-demo-app:extract-rules-engine",
    "cms-adapters:metadata": "yarn cms-adapters:components && yarn cms-adapters:localizations && yarn cms-adapters:style && yarn cms-adapters:rules-engine", 
  }
```

#### Project with module subentries

The rules-engine extractor will generate metadata files with your facts type definition with reference to schema json
file for your more complex interface.
It will parse your project and its node_modules files to identify your facts' schemas.
If your project contains sub-entries generated via the otter angular builder (otterBuilder), the schema generator will not
know how to find the files located in the sub-entries as they are not part of your module index.ts nor part of your
node_modules.

If you find yourself in this situation, you can specifically include additional paths to parse reference to other module
sub-entries in the cms tsconfig file.

```JSON
// tsconfig.cms.json
// exemple to resolve the otter library default facts dependant of the otter/store subentries
{
  ... 
  "extraOptions": {
    "otterSubModuleRefs": ["../store/**/index.ts"], // Relative path to index.ts of your project subentries your facts depends on
  },
  ...
}
```

Caution: If the interface in a module refers to another module sub-entry, it will be ignored. This is a known limitation.

ex:

```typescript
// myFacts.ts
import {SubEntryClass} from '@myLib/someModule/subEntry';

export interface MyFacts extends FactDefinitions {
  someProperty: SubEntryClass;
}
```

```typescript
// subEntry.ts
import {OtherSubEntryClass} from '@myLib/someModule/otherSubEntry';
import {SameSubEntryClass} from './sameSubEntry';
import {SomeNodeModulesRef} from 'someNodeModule';

export interface SubEntryClass extends OtherSubEntryClass, SameSubEntryClass, SomeNodeModulesRef {
  property: string;
}
```

```JSON
// tsconfig.cms.json
{
  ...
  "extraOptions": {
    "otterSubModuleRefs": ["../someModule/**/index.ts"], // Relative path to  someModule/otherSubEntry and someModule/subEntry index.ts files
  }
}
```

In that example, the metadata generated for your MyFacts will contain the SubEntryClass, SameSubEntryClass and
SomeNodeModulesRef definition but will ignore the OtherSubEntryClass definition.

## Next steps

Congratulations, once you have integrated the rules engine in your application, you can now start to write your rules.
Please follow [CMS documentation](https://dev.azure.com/AmadeusDigitalAirline/DES%20Platform/_wiki/wikis/DES%20Documentation/1954/Content-rules).
