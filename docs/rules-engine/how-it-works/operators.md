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

## Operator metadata
The cms-adapters shall expose your operator metadata in a dedicated json to communicate with AEM.
see [CMS Adapters](../../cms-adapters/CMS_ADAPTERS.md)
Each operator describes the accepted types for each of its operands:
```json
    {
      "id": "allGreater",
      "description": "Check if every numerical value of the variable is greater than a specific value",
      "display": "all >",
      "leftOperand": {
        "types": [
          "number"
        ],
        "nbValues": -1
      },
      "rightOperand": {
        "types": [
          "number"
        ],
        "nbValues": 1
      }
    }
```

The id, description and display describe the operator while the left and right operands provide a contract on the accepted
types. The types will refer to the accepted types while the nbValue will provide the number of items expected for the 
operand: -1 refers to an array, 0 to a union of object with one element and an array, 1 will refer to a single element.

### Supported type Metadata
The types supported by AEM are the following: ``string | boolean | Date | number | object``. 
If you want to refer to any other types, it will be replaced with the ``unknown`` type as AEM will not be able to parse it.
You can still use it and create your own validator to ensure your type but it will not be part of the metadata.

Note that if you want to refer to a simple type ``string | boolean | Date | number``, you can use the ``SupportedSimpleTypes``
interface. It will be replaced with this list of types during the metadata extraction.

Today, we do not yet support references to aliases from different types, so the ``SupportedSimpleTypes`` will be the only
alias you can use to refers to the ``string | boolean | Date | number`` type.
```typescript
export const notArrayContains: Operator<SupportedSimpleTypes[], SupportedSimpleTypes> = {
  name: 'notArrayContains',
  evaluator: (array, value) => array.indexOf(value) === -1,
  validateLhs: (inputArray) => Array.isArray(inputArray)
};
```

