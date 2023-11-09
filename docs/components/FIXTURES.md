# Component fixtures

## 1. Why fixtures for components?

Testing the component class is as easy as testing a service.
But a component is more than just its class. A component interacts with the DOM and with other components. The class-only tests can tell you about class behavior.
They cannot tell you if the component is going to render properly, respond to user input and gestures, or integrate with its parent and child components.

Here is where components fixtures are coming in place. They are classes which contain mainly accessors to the DOM of the components. Each component has its own fixture class.
The purpose of the fixtures is to help for debugging, testing the component itself, and integration with parents and child components.

## 2. How to create fixtures?

The main problem which was raised here was how to use the fixtures with customization components (components which are replacing the default ones in a block structure). Block component fixture should support default fixtures and custom ones.
Let's take the case of containers and presenters which are using the [customization technique](./COMPONENT_REPLACEMENT.md). To recap, presenters are components which handle the display(UI logic) and containers are components which
handle the communication with services, making backend calls etc.
- For presenters, the fixtures are straight forward meaning that they will contain mainly dom accessors.
- The container fixtures will mainly do the link with the presenters ones. The container will be the one which will decide which fixtures to use for the presenters.
If the custom fixtures are provided for a presenter they will replace the default ones.

### How to provide custom fixtures

The prototype of a custom presenter fixtures is sent to the container fixture object at instantiation.
Fixtures context are put in place to be able to identify which fixtures are customizable inside a component.

Example:
```typescript
import {FixtureWithCustom, Constructable} from "@o3r/testing/core";

export interface ExampleComponentFixturesContext extends FixtureWithCustom {
  /**
   * Presenter1 custom fixture and custom fixtures for its subcomponents
   */
  presenterFixture1?: {
    fixture?: Constructable<Presenter1ViewFixture, Presenter1FixturesContext>,
    customSubFixtures?: Presenter1FixturesContext
  };

  /**
   * Presenter2 custom fixture and custom fixtures for its subcomponents
   */
  presenterFixture2?: {
    fixture?: Constructable<Presenter2ViewFixture, Presenter2FixturesContext>,
    customSubFixtures?: Presenter2FixturesContext
  };
}

// Presenter 1 fixture context
export interface Presenter1FixturesContext extends FixtureWithCustom {
  /**
   * Presenter1 custom fixture and custom fixtures for its subcomponents
   */
  fixtureInPresenter1?: {
    fixture?: Constructable<FixtureInPresenter1View, FixtureInPresenter1Context>,
    customSubFixtures?: FixtureInPresenter1Context
  };
}
```

Each presenter fixture is aware of its subcomponents fixtures.
```Constructable``` is used in order to give the possibility to send only the prototype of a custom fixture, from test creation level, and instantiate it in container.
```FixtureWithCustom``` is a constraint which should be extended to every fixture context. It ensures that the context can define for each presenter its fixture, its subcomponents fixtures and nothing else.

In container class:

```typescript
// This class implements its presenters types
// ComponentFixture is a base class which should be extend by each fixture
export class ExampleContainerFixture extends O3RComponentFixture implements Presenter1ViewFixture, Presenter2ViewFixture {

  protected presenter1Fixture: CalendarPerBoundDateViewFixture;
  // default date cell view type
  protected presenter1FixtureType: Constructable<Presenter1ViewFixture, Presenter1ViewFixture> = Presenter1ViewFixture;
  // all presenters inside the container

  ...

  constructor(elem?: Element, customFixtures?: ExampleComponentFixturesContext) {
    super(elem);
    if (customFixtures && customFixtures.presenterFixture1 && customFixtures.presenterFixture1.fixture) {
      this.presenter1FixtureType = customFixtures.presenterFixture1.fixture;
    }
    const presenter1ViewCustomSubfixture = customFixtures && customFixtures.presenterFixture1 && customFixtures.presenterFixture1.customSubFixtures;
    // Presenter1 fixture object creation based on the type (custom or default)
    this.presenter1Fixture = new this.presenter1FixtureType(elem, presenter1ViewCustomSubfixture);
  }

  /**
   * The method here is forwarding a call to the presenter's method
   * The presenter can be the custom one or the default one. This was decided before in the constructor in this case
   */
  getElementText() {
    return this.presenter1Fixture.getElementText();
  }
}
```

In the test:

```typescript
// Custom fixture is implementing the default one
export class CustomFixtureInPresenter1 implements FixtureInPresenter1View {
...
}

// in the test class
...
const customFixtures: ExampleComponentFixturesContext = {
        presenterFixture1: {
          customSubFixtures: {
            fixtureInPresenter1: {
              fixture: CustomFixtureInPresenter1
            }
          }
        }
      };

componentObject = new ExampleContainerFixture(new O3RElement(fixture.debugElement), customFixtures);
```
### How to use a specific HTML Element

Per default a query on the DOM will return an `O3rElement` than allow basic access to the HTML element you target. In some cases you already know the nature of the element you target and want to use commands specific to this element.

A concrete case is a `Select` element. If you want to specify that the result of the query on the DOM is an HTML Select you have **2 ways** to do it.

Specify it to the query functions:
```typescript
import {O3rSelectElement} from "@o3r/testing/core";

const selectElement = myElement.query(".select-element-first", O3rSelectElement);

const selectElements = myElement.queryAll(".select-element", O3rSelectElement);

if (selectElement) {
  selectElement.selectByIndex(1); // Select the second item of the list
}

selectElements
  .forEach((el) => el.selectByIndex(1));
```

Wrap the element:
```typescript
import {O3rSelectElement} from "@o3r/testing/core";

const element = myElement.query(".select-element-first");

if (element) {
  const selectElement = new O3rSelectElement(element)
  selectElement.selectByIndex(1); // Select the second item of the list
}
```

Some list of elements can be regrouped to simplify the actions to execute on them. This is the case for the RadioGroup:

```typescript
import {O3rRadioElement} from "@o3r/testing/core";

const radioGroup = myElement.queryAll(".my-radios", O3rRadioElement, O3rRadioGroup);

cont selectedRadioElement: O3rRadioElement = radioGroup.getSelectedItem();
```
