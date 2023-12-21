# Operators

A condition has 3 different parts :
* a left operand (FACT, RUNTIME_FACT or LITERAL)
* an operator
* [optional] a right operand (FACT, RUNTIME_FACT or LITERAL)

Each operator has its unique name, functions to validate its operands and evaluate function that will output the result.

Example of usage :
```json
{
  "lhs": {
    "type": "FACT",
    "value": "isMobileDevice"
  },
  "operator": "equals",
  "rhs": {
    "type": "LITERAL",
    "value": true
  }
}
```

## Full operator list provided by default

`[]` means the variable is an array of primitives

| Type        | Operator                  | Display                | Description |
| ----------- | ------------------------- | ---------------------- | ----------- |
| All         | equals                    | is equal to            | Check if a variable is equal to a specific value |
| All         | notEquals                 | is not equal to        | Check if a variable is different than a specific value |
| All[]       | allEqual                  | all equal to           | Check if every values of the variable equals a specific value |
| All[]       | oneEquals                 | one equal to           | Check if at least one of the values of the variable equals a specific value |
| All[]       | oneIn                     | one in                 | Check if at least one of the values of the variable is equal to one in a specified list |
| All[]       | allIn                     | all in                 | Check if every values of the variable are in a specific list |
| All[]       | allNotIn                  | none in                | Check if every values of the variable are not in a specific list |
| All[]       | arrayContains             | contains               | Check if any of the variable's value is equal to a specific value |
| All[]       | notArrayContains          | does not contain       | Check if every values of the variable are different than a specific value |
| All         | inArray                   | is in                  | Check if the variable's value is included in a specified list |
| All         | notInArray                | is not in              | Check if the variable's value is not included in the value list |
| All         | isDefined                 | is defined             | Check if the variable and its value is defined |
| All         | isUndefined               | is not defined         | Check if the variable and its value is undefined |
| Date        | inRangeDate               | is between             | Check if a date variable is in a specified date range |
| Date        | dateInNextMinutes         | is in next minutes     | Check if a date is in the next specified minutes |
| Date        | dateNotInNextMinutes      | is not in next minutes | Check if a date is not in the next specified minutes |
| Date        | dateBefore                | is before              | Check if a date variable is prior than a specified date |
| Date        | dateAfter                 | is after               | Check if a date variable is posterior than a specified date |
| Date        | dateEquals                | is equal to            | Check if a date variable is the same as a specified date |
| Date        | dateNotEquals             | is not equal to        | Check if a date variable is different from a specified date |
| Number      | lessOrEqual               | ≤                      | Check if the number variable is lower or equal to a specific value |
| Number      | lessThan                  | <                      | Check if the number variable is lower than a specific value |
| Number      | greaterThanOrEqual        | ≥                      | Check if the number variable is greater or equal to a specific value |
| Number      | greaterThan               | >                      | Check if the number variable is greater than a specific value |
| Number[]    | allLower                  | all <                  | Check if every numerical values of the variable are lower than a specific value |
| Number[]    | allGreater                | all >                  | Check if every numerical values of the variable are greater than a specific value |
| Number[]    | oneLower                  | one <                  | Check if one of the values of the variable is lower than a specific value |
| Number[]    | oneGreater                | one >                  | Check if one of the values of the variable is greater than a specific value |
| Number[]    | allRangeNumber            | all between            | Check if every values of the variable are included in a specified range |
| Number[]    | oneRangeNumber            | one between            | Check if one of the values of the variable is included in a specified range |
| String      | inString                  | within                 | Check if the text variable is part of the specified value |
| String      | matchesPattern            | matches                | Check if the text variable matches a specific pattern |
| String      | notInString               | not within             | Check if the text variable is not part in the specified value |
| String      | stringContains            | contains               | Check if the specified text value is included in the text variable |
| String      | notStringContains         | does not contain       | Check if the specified text value is not included in the text variable |
| String[]    | allMatch                  | all match              | Check if every string values of the variable match a specific pattern |
| String[]    | oneMatches                | one matches            | Check if one of the values of the variable matches a specific pattern |
| All[]       | lengthEquals              | number of =            | Check if the number of values of the variable is equal to a specific value |
| All[]       | lengthNotEquals           | number of ≠            | Check if the number of values of the variable is different from a specific value |
| All[]       | lengthLessThanOrEquals    | number of ≤            | Check if the number of values of the variable is lower or equal to a specific value |
| All[]       | lengthLessThan            | number of <            | Check if the number of values of the variable is lower than a specific value |
| All[]       | lengthGreaterThanOrEquals | number of ≥            | Check if the number of values of the variable is greater or equal to a specific value |
| All[]       | lengthGreaterThan         | number of >            | Check if the number of values of the variable is greater than a specific value |

> **Note**: For the operators comparing a text variable to a pattern (such as `matchesPattern`, `oneMatches`, and `allMatch`), 
> we support the ES RegExp `/^myRegExp.*$/i` (containing the pattern and optional flags) or just the RegExp content `^myregexp.*$`.
> 
> The special characters used in the pattern should contain a double backslash (`\\`).
> For example, to check if a string contains a `\t`, the pattern would need to include `\\t`.
> 
> > Also, to avoid the wrong detection of an ES RegExp instead of RegExp content, a content beginning with a slash `/` character
> > (such as a path `/path/to/file`) should be preceded by a double backslash `\\` (for example `\\/path/to/file`)

You can create your own operator in your application and add it to the engine.
Note that the @title provides a string for the operator that can be displayed in an edition UI for better clarity (ex: < for lessThan).
The tsdoc will be used as description.

```typescript
/**
 * My custom operator that evaluates if a string is contained in another one
 * @title MyTitle
 */
export const customOperator: Operator<string, string> = {
  name: 'containedId',
  evaluator: (a, b) => a.indexOf(b) > -1,
  validateLhs: (a) => typeof a === 'string' || a instanceof String,
  validateRhs: (a) => typeof a === 'string' || a instanceof String
};
```

## Operators with dependencies

### dateInNextMinutes and dateNotInNextMinutes

The rules engine provides two operators, `dateInNextMinutes` and `dateNotInNextMinutes` that need the current time in order to execute. These special operators depend on an inner fact, `o3rCurrentTime`. The `o3rCurrentTime` fact is registerd in the Rules Engine service but, if needed, one could override the default behavior in the app (see 'Override the default inner fact' section below).

#### Usage

```json
{
  "id": "5467e501-b9ff-414f-8026-56885d0d7a4c",
  "name": "The otter is late",
  "disabled": false,
  "outputRuntimeFacts": [],
  "inputRuntimeFacts": [],
  "rootElement": {
    "elementType": "RULE_BLOCK",
    "blockType": "IF_ELSE",
    "condition": {
      "all": [
        {
          "lhs": {
            "type": "FACT",
            "value": "outboundDate"
          },
          "rhs": {
              "type": "LITERAL",
              "value": "2880"
          },
          "operator": "dateInNextMinutes"
        }
      ]
    },
    "successElements": [
      {
        "elementType": "ACTION",
        "actionType": "UPDATE_ASSET",
        "asset": "otter.svg",
        "value": "otter-late.svg"
      }
    ],
    "failureElements": []
  }
}
```

#### Override the default inner fact
Create a custom fact service that is overriding the value of `o3rCurrentTime`

```typescript
import { Injectable } from '@angular/core';
import { CurrentTimeFacts, FactsService, RulesEngineService } from '@o3r/rules-engine';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentTimeFactsService extends FactsService<CurrentTimeFacts> {

  private currentTimeSubject$ = new BehaviorSubject(new Date('2023-11-2').getTime()); // define a date in the past instead of the current time
  /** @inheritDoc */
  public facts = {
    o3rCurrentTime: this.currentTimeSubject$.asObservable()
  };

  constructor(rulesEngine: RulesEngineService) {
    super(rulesEngine);
  }

  /** Compute the current time */
  public tick() {
    this.currentTimeSubject$.next(Date.now());
  }
}
```

The application has to register the custom service.

```typescript
constructor(
  ...
  private currentTimeFactsService: CurrentTimeFactsService
)

ngOnInit() {
  ...
  this.currentTimeFactsService.register();
}
```

Here, `CurrentTimeFactsService` also provides a `tick()` method that, when called, it recomputes the current time. It is up to the application to decide how ofter the current time should be recomputed (at a given time interval, on page navigation, etc).
