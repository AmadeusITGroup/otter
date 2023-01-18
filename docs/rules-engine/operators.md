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
  "operator": "equal",
  "rhs": {
    "type": "LITERAL",
    "value": true
  }
}
```

Full operator list provided by default: [Operators](https://dev.azure.com/AmadeusDigitalAirline/DES%20Platform/_wiki/wikis/DES%20Documentation/1954/Content-rules?anchor=operator-list)  

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


