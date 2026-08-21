---
name: logic-component-shape
description: Decision tree for whether a component is a single component or a container/presenter pair, which componentStructure to generate, and which O3rComponent componentType to declare. Invoked by the `logic-placement` and `logic-review` skills, which own the surrounding workflow — it is not meant to answer a user question on its own.
---

# Decision tree — component shape

Returns: **single component**, or **container + presenter**, plus the `componentStructure` to generate and the `componentType` to declare.

**Default to a single component.** A split separates data and business-logic access from pure presentation, and the [container/presenter documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/CONTAINER_PRESENTER.md) says a component interacting with external entities *may* be split — not that it must be.

## Will something vary?

The split puts a seam between data access and presentation so one can vary without touching the other. It is worth its cost only when something on one side actually varies.

```
CRITERION A  one data source, several UI flavours
             dense table on desktop and stacked cards on mobile; an A/B variant
             without the seam: the fetch is duplicated per variant, or the template
             branches on display concerns

CRITERION B  one UI flavour, several data sources
             a passenger list rendered from a search result on one screen and from a
             saved itinerary on another
             without the seam: the presentation is copied, and the copies drift

CRITERION C  the presenter must be CMS-replaceable or configurable
             integrators swap or configure it at runtime through Otter's component
             replacement mechanism, which needs the display half to be its own
             component whose inputs and outputs are the contract

IF   any of A, B, C is true  -> BRANCH A: container + presenter
ELSE                         -> BRANCH B: single component
```

**Name what varies before splitting.** If you cannot say which of data source, display, or integrator-supplied implementation will differ, there is nothing for the seam to absorb.

"The logic feels complex enough to separate" is **not** an additional criterion. Complexity alone is a human judgement call — see the **split without variation** stop-and-ask in `logic-placement`.

## Branch A — container + presenter

```
RECOMMENDATION  <name>-cont + <name>-pres
SCHEMATIC       ng g component <name> --componentStructure=full
VERIFY          the container injects Store, services, or SDK clients, and dispatches
                the presenter declares inputs and outputs only
                the presenter renders from a spec by supplying inputs alone
```

### Who owns what

| Concern | Owner |
|---|---|
| Inject `Store`, dispatch, select | container |
| Call a service or SDK client for shared data | container |
| Map store or API models to view models | container |
| Business rules, custom validators, submit handling | container |
| Router, guards, query params | container |
| Choose which presenter flavour to render | container |
| Format, sort, filter data already received | presenter |
| Local UI state (open/closed, tab, page, hover) | presenter |
| Emit user intent upward | presenter |
| Styling, animation, breakpoints | presenter |

Data down through inputs, events up through outputs.

**The leak is often indirect.** A presenter that injects no store and makes no HTTP client can still reach both through a service. Judge by what the service *does*, not by what the presenter imports: if it selects from the store, calls an API, or triggers a side effect beyond the component, it belongs in the container. A presenter may inject presentation helpers only — formatting, breakpoints.

### Forms across the seam

A form is the case where the seam is easiest to get wrong, because both halves hold part of it. Otter's form documentation calls them **parent component** and **input component**; those map onto container and presenter respectively.

- **Custom validators** — business rules, or rules spanning several controls — are declared in the **container** and passed to the presenter through an input. The presenter applies them to the form but does not own them.
- **Primitive validators** — simple, configurable, single-control — are declared in the **presenter**.
- **Submit logic always sits in the container.** The submit button may render in the presenter or at page level; either way the presenter only notifies that submit was fired, and the container runs the business logic and emits the outcome.
- The presenter implements `ControlValueAccessor` and `Validator`, so value, status, and errors propagate up to the container as they would from a native input.

That is the same rule as everywhere else in this table: business meaning in the container, the mechanics of display and input in the presenter.

## Branch B — single component

```
RECOMMENDATION  single component <name>
SCHEMATIC       ng g component <name> --componentStructure=simple
VERIFY          no -cont or -pres suffix anywhere in file, class, selector, or template
                no container that would only forward its inputs
```

Two shapes where nothing can vary:

- **Small presentational elements** — a badge, an icon, a price label, a spinner. They take inputs, render, and emit; there is nothing for a container to own.
- **Self-contained screens with one data source** — fetch once, render the result. Splitting becomes defensible when a second flavour or a CMS requirement appears; on day one it buys nothing.

Splitting anyway produces a container that only forwards inputs, which is the failure mode to avoid. The documentation applies the same rule to the folder layout:

> A component with only a presenter and no container should not have a presenter folder

> A functional area containing only one block should not have a sub-folder for it

A single component is not a dead end: `ng g component --componentStructure=presenter` adds the display half later to what already exists.

## Which componentStructure to generate

| Decision | `componentStructure` |
|---|---|
| Single component | `simple` |
| Container + presenter pair | `full` |
| Container only, presenter already exists | `container` |
| Presenter only, added to an existing container | `presenter` |

Use `otter-schematics` to discover the schematic and its current options. It also produces the naming and folder layout, so neither needs deriving by hand — see the [container/presenter documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/CONTAINER_PRESENTER.md) for the `*-cont` / `*-pres` conventions.

## Which componentType to declare

Every Otter component carries `@O3rComponent({ componentType })`, and the value must agree with the role assigned above.

| Value | Meaning | Role |
|---|---|---|
| `Page` | Displays an application route | container |
| `Block` | Handles a functional area | container |
| `ExposedComponent` | Needs to be exposed in the CMS | presenter |
| `Component` | Neither exposed nor fitting the others | presenter, or a single unsplit component |

A mismatch reliably means logic sits in the wrong place: a `Page` that injects nothing and only holds display state is a presenter; a `Component` that dispatches store actions is a container. Either the type or the logic must move.

`Block` versus `ExposedComponent` cannot be inferred from the code — it depends on whether integrators are meant to configure or replace the component. See the **CMS replacement undecided** stop-and-ask in `logic-placement`; the choice determines what is extracted into CMS metadata and is disruptive to change afterwards.

## Example — the seam, both halves

```typescript
@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'my-app-passengers-cont',
  imports: [PassengersPres],
  templateUrl: './passengers-cont.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PassengersCont implements OnInit {
  private readonly store = inject(Store);
  private readonly passengerApi = inject(PassengerApi);

  /** Passengers to display, selected from the store */
  public readonly passengers = toSignal(this.store.pipe(select(selectAllPassengers)), { initialValue: [] });

  public ngOnInit() {
    this.store.dispatch(setPassengersEntitiesFromApi({
      call: this.passengerApi.getPassengers(),
      requestId: 'passengers-initial-load'
    }));
  }

  /** Forwarded from the presenter's output */
  public onPassengerSelected(passengerId: string) {
    this.store.dispatch(selectPassenger({ passengerId }));
  }
}

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'my-app-passengers-pres',
  templateUrl: './passengers-pres.html',
  styleUrls: ['./passengers-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PassengersPres {
  /** Passengers to render */
  public readonly passengers = input.required<Passenger[]>();

  /** Emitted when the user picks a passenger */
  public readonly passengerSelected = output<string>();

  /** Local UI state: nothing outside this component needs it */
  public readonly sortDirection = signal<'asc' | 'desc'>('asc');

  /** Display ordering derived from inputs plus local state */
  public readonly sortedPassengers = computed(() => {
    const factor = this.sortDirection() === 'asc' ? 1 : -1;
    return [...this.passengers()].toSorted((a, b) => factor * a.lastName.localeCompare(b.lastName));
  });
}
```

The presenter renders from a spec by supplying `passengers` alone — that is the test for a clean split. Two details:

- The store selection stays an observable and is bridged with `toSignal` at the component boundary. `initialValue` is what makes it assignable to a required signal input; `passengers$ | async` would widen the type to `Passenger[] | null` and fail under `strictTemplates`. See `rxjs-vs-signals`.
- Not every Otter decorator has a signal equivalent. `@Localization` on a `translations` property still requires the decorator-based `@Input()`, so check which form the decorator you need supports rather than generalizing to signals.

## Documentation

- [Container / Presenter](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/CONTAINER_PRESENTER.md) — naming conventions, folder layout, structural guidelines
- [Component introduction](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/INTRODUCTION.md) — the `@O3rComponent` decorator and component types
- [Form validation](https://github.com/AmadeusITGroup/otter/blob/main/docs/forms/FORM_VALIDATION.md) and [form submit](https://github.com/AmadeusITGroup/otter/blob/main/docs/forms/FORM_SUBMIT_AND_INTERCOMMUNICATION.md) — the parent / input component division these docs describe, which the forms section above maps onto container and presenter
