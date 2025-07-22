# Rules engine - Industrialize your ruleset generation

The Ruleset JSON object fed to the Otter rules-engine just needs to follow the Otter's ruleset schema.
You could write a JSON file with all your Rulesets and maintain it manually, but this can become tedious if you often
update them or if the people in charge of the configuration of your application are not the one build it.

For these cases, you may want to build your own administration UI. To do this, you could either list all the configurations,
translations, rules capabilities of your application and maintain manually, but this is particularly error-prone and can
be really repetitive.

To avoid this, you may instead have a generic administration UI that would take the list of all your application's
metadata (list of configurable components and their associated configuration and localization, list of all the supported
operators etc.) and use them as an input for your administration UI.

This is where the Otter framework can help you by providing a 'rules-engine' extractor for the facts and operators of
the application or component library.


> [!INFO]
> You will also need the metadata related to the action you want to expose (update of configuration, localization etc.) 
> but these will be scoped in their respective packages.
> 
> Each relevant package exposes a set of metadata extractors to generate the application metadata related to the feature.
> Check out their dedicated documentation for more information.

## How to use it

You can run the Otter's rules engine extractor like any Angular builder.
Declare it in your `angular.json` and run it as a script: `ng run my-project:extract-rules-engine`:

```json5
// angular.json
{  
  //...
  "projects": {
    "my-project": {
      "architect": {
        //...
        "extract-rules-engine": {
          "builder": "@o3r/rules-engine:extractor",
          "options": {
            "tsConfig": "./tsconfig.cms.json",
            "libraries": [
              // List of libraries with rules-engine metadata that needs to be included in the project's metadata 
              "@o3r/rules-engine",
              // My libraries
            ],
            "outputFactsDirectory": "",
            "outputOperatorsDirectory": "",
            "factFilePatterns": [
              "src/**/!(portal)/*.facts.ts"
            ],
            "operatorFilePatterns": [
              "src/operators/*.operators.ts"
            ],
            "ignoreFactsFromLibraries": [
              "@o3r/rules-engine"
            ]
          }
        }
      }
    }
  }
}
```

## How it works

Like all the other Otter extractors, the rules engine extractor parses the code files declared in the `tsConfig` file defined
in the builder's parameters and will build a model from the methods and class typings and comments.

### Operator metadata

The operator files are identified by the `operatorFilePatterns` input in the `angular.json` builders. 
It will transform an operator (identified by the `Operator` and `UnaryOperator` types) such as:

```typescript
/**
 * My custom operator that evaluates if a string is contained in another one
 * 
 * @title My Title
 */
export const customOperator: Operator<string, string> = {
  name: 'containedId',
  evaluator: (a, b) => a.indexOf(b) > -1,
  validateLhs: (a) => typeof a === 'string' || a instanceof String,
  validateRhs: (a) => typeof a === 'string' || a instanceof String
};
```

into a JSON model:
```json5
{
  "id": "customOperator",
  "description": "My custom operator that evaluates if a string is contained in another one",
  "display": "My Title",
  "leftOperand": {
    types: ["string"], // Supported types for the left operand
    nbValues: 1 // Would be -1 if the left operand was an array
  },
  "rightOperand": {
    types: ["string"], // Supported types for the right operand
    nbValues: 1 // Would be -1 if the right operand was an array
  }
}
```

The id, description and display describe the operator while the left and right operands provide a contract on the accepted
types. The `types` property will refer to the accepted types while the `nbValue` property will provide the number of 
items expected for the operand: -1 refers to an array, 0 to a union of an object with one element and an array, 1 will refer
to a single element.

> [!NOTE]
> The contract is not only based on the method name and its signature.
> Here, the `@title` decorator in the tsdoc is used to specify a user-friendly name for the operator.

> [!NOTE] 
> The models for the `OperatorsMetadata` are available in the [rules engine metadata interface file](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/rules-engine/builders/rules-engine-extractor/helpers/rules-engine.extractor.interfaces.ts).

#### Operands supported types

The types supported by the operands are the following: `string | boolean | Date | number | object`.
If you want to refer to any other types, it will be replaced with the `unknown` type.

You can still use it and create your own validator to ensure your type, but it will not be part of the metadata.

Note that if you want the operand to match any simple type `string | boolean | Date | number`, you can use the 
`SupportedSimpleTypes` interface. It will be replaced with this list of types during the metadata extraction.

Today, we do not yet support references to aliases from different types, so the `SupportedSimpleTypes` will be the only
alias you can use to refer to the `string | boolean | Date | number` type:

```typescript
export const notArrayContains: Operator<SupportedSimpleTypes[], SupportedSimpleTypes> = {
  name: 'notArrayContains',
  evaluator: (array, value) => array.indexOf(value) === -1,
  validateLhs: (inputArray) => Array.isArray(inputArray)
};
```

### Facts Metadata

The fact files are identified thanks to the `factFilePatterns` parameters of the `@o3r/rules-engine:extractor` builder.
The extractor will extract all the facts models (identified with the `FactDefinitions` interface) of your project:

```typescript
const EnumType = 'a' | 'b';

interface OtherInterface {
  /**
   * Description of property
   */
  property: number
}
interface ComplexInterface  {
  /**
   * Description of property1
   */
  property1: OtherInterface[]
}

interface CustomFacts extends FactDefinitions {
  /** Description of fact1 */
  fact1: string,
  /** Description of fact2 */
  fact2: ComplexInterface,
  /** Description of fact3 */
  fact3: EnumType
}
```
```json5
// rules.facts.metadata.json
{
  "facts": [
    {
      "name": "fact1",
      "description": "Description of fact1",
      "type": "string"
    },
    {
      "name": "fact2",
      "description": "Description of fact2",
      "type": "object",
      "schemaFile": "fact-schemas/complex-interface.schema.json"
    },
    {
      "name": "fact3",
      "description": "Description of fact3",
      "type": "string",
      "enum": ["a", "b"]
    }
  ]
}
```

You can note that the `ComplexInterface` fact results in a separated schema file that validates the interface model:

```json5 
{
  "type": "object",
  "properties": {
    "property1": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/OtherInterface"
      }
    }
  },
  "definitions": {
    "OtherInterface": {
      "type": "object",
      "description": "Description of property1",
      "properties": {
        "property": {
          "description": "Description of property",
          "type": "number"
        }
      }
    }
  }
}
```

> [!NOTE]
> The models for the `OperatorsMetadata` are available in the [rules engine metadata interface file](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/rules-engine/builders/rules-engine-extractor/helpers/rules-engine.extractor.interfaces.ts).

### Project with module sub-entries

As mentioned in the previous section, the extractor looks into your project and the files of its dependencies to identify
the schema of your complex facts.

If your project is a library with sub-entries, the schema generator will not know how to find the files they contain as
they are not part of your module `index.ts` nor part of your dependencies. 
If you define your fact based on interfaces defined in your sub-entries, it will result in an incomplete schema.

If you find yourself in this situation, you can specifically include additional paths to the sub-entries in the extractor
[tsconfig file](#how-to-use-it).

```JSON5
// tsconfig.cms.json
{
  // ...
  "extraOptions": {
    "otterSubModuleRefs": ["./**/my-sub-entry/index.ts"], // Relative path to the index.ts where the interfaces of your sub-entry are exported
  },
  // ...
}
```

This will allow the extractor to find the definition of your sub-entry interface and generate their schema files.
For instance, let's consider the `MyFacts` object defined below.

```typescript
// myFacts.ts
import {SubEntryClass} from '@myLib/my-sub-entry/subEntry';

export interface MyFacts extends FactDefinitions {
  someProperty: SubEntryClass;
}
```

The extraction will result in an object with a reference to the `SubEntryClass` model which will be created during the extraction:

```json5
{
  "facts": [
    {
      "name": "someProperty",
      "type": "object",
      "schemaFile": "fact-schemas/sub-entry.schema.json"
    }
  ]
}
```

> [!WARNING]
> The fact extractor is not able to make references to sub-entry schemas in other model schema files. 
> That means that if the `SubEntryClass` refers to another sub-entry, it will be ignored.
>
> In the following example, there will be a schema generated for the `SubEntryClass`, and it will describe the 
> definitions of `SameSubEntryClass` and `SomeNodeModulesRef`, but will ignore the `OtherSubEntryClass`
> definition. 
> 
> This is a known limitation.

```typescript
// subEntry.ts
import {OtherSubEntryClass} from '@myLib/someModule/otherSubEntry';
import {SameSubEntryClass} from './sameSubEntry';
import {SomeNodeModulesRef} from 'someNodeModule';

export interface SubEntryClass extends OtherSubEntryClass, SameSubEntryClass, SomeNodeModulesRef {
  property: string;
}
```
