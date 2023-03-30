# Facts

A fact is a stream of values.
This allows a big optimization since the rules engine will react to a fact change in order to execute only the subset of rules that relies on this fact.

During a rule execution, its conditions will be evaluated using the latest fact value(s).

## Properties

- **id**: unique id of the fact
- **value$**: stream of values of the fact

## Example

```typescript
import { of, Subject } from 'rxjs';

// stream of fact values
const factStream = new Subject();

// simple fact
const fact = {
  id: 'factId',
  value$: factStream.asObservable()
}

// simple fact with static value
const staticFact = {
  id: 'staticFactId',
  value$: of('value')
}
```

## Runtime Fact

A runtime fact is a temporary fact that can only be set by a rule's action. It will only exist during the ruleset execution.

See the [runtime-facts](../examples/runtime-facts.md) example.


Note that the runtime fact is only accessible in the ruleset where it has been defined. If you create 2 runtime facts in two different rulesets it will be 2 different entities, isolated from each others.
