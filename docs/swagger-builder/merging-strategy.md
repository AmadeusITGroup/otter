# Merging Strategy

The **Swagger Builder** differentiates five kinds of item from a specification:

1. The **definitions**
2. The **parameters**
3. The **Tags**
4. The **paths**
5. The **templates** (this includes all the fields defined in Swagger 2.0 which are not part of the three first items).

During the merge process, the tool will list all items included in the four kinds and will add each item into the same list of items in the previous Swagger specification.

## Merging Order

Merging applies to the list of Swagger specifications in input from the first one (left) to the last one (right). This means that the last Swagger specification of the list will be the one used in case of replacement.

There are three ways to provide a list of Swagger specifications:

1. As `CLI argument` specified directly in the **Swagger Builder** command.
2. Inside the `specs` field of the configuration file (provided via the `--configuration` option)
3. Into the [list of APIs](./multi-apis.md) (provided via the `--apis` options)

The priority will be managed from left to right, as follows:
`spec` -> `CLI argument` -> *API*.

## Conflict management

Conflict management is processed differently depending on the type of items that are conflicting:

- In the case of **definitions**, **parameters** and **Tags**, the latest item will be used.

```yaml
# input 1:
definitions:
  example:
    type: object
    properties:
      ex1:
        type: string
      ex2:
        type: string

# input 2:
definitions:
  example:
    type: object
    properties:
      ex1:
        type: number

# Will be merged to:
definitions:
  example:
    type: object
    properties:
      ex1:
        type: number
```

- In the case of **paths**, the merging process will stop with an error (*status code 1*). The error can be ignored thanks to the `--ignore-conflict` option that resolves the **paths** conflicts in the same way as for the **definitions** and **parameters**.

- The **templates** are merged field by field. In case of conflict, the latest one will be taken

## How to

### Override a definition

As specified in the [conflict management section](#conflict-management), a definition can be easily overridden with a new definition with the **same name**.

Example:

```yaml
# input 1:
definitions:
  Example:
    type: object
    ...

# input 2:
definitions:
  Example:
    type: object
    ...

# Will be merged to result to the Example definition of the input 2
```

### Extend a definition

A definition can be extended by using a *recomposition* thanks to the `allOf` instruction of Swagger 2.0:

```yaml
# input 1 (@api/public-swagger-spec package):
definitions:
  Example:
    type: object
    properties:
      exampleField:
        type: string
      ...

# input 2 (@custom/public-swagger-spec package):
definitions:
  Example:
    type: object
    allOf:
      - $ref: '@api/public-swagger-spec#/definitions/Example'
      - type: object
        properties:
          otherExampleField:
            type: string
        ...
```

> Refer to the [referencing documentation](./referencing.md) to get information regarding the package reference.

### Override a path resource

As specified in the [conflict management section](#conflict-management), a path resource override will produce an error unless the `--ignore-conflict` flag has been specified. If specified, the resource can be overridden with the same **path** and **method**.

Example:

```yaml
# input 1:
paths:
  /examples/{id}:
    get:
      ...

# input 2:
paths:
  /examples/{id}:
    get:
      ...

# Will be merged to result to the /examples/{id} resource of the input 2
```

### Extend an existing path resource

As specified in the [conflict management section](#conflict-management), a path can be easily updated with a new resource by specifying the same **path** but a different **method**.

> [!TIP]
> The `--ignore-conflict` flag is not necessary if no couple *path*, *method* is conflicting.

Example:

```yaml
# input 1:
paths:
  /examples/{id}:
    get:
      ...

# input 2:
paths:
  /examples/{id}:
    POST:
      ...

# Will be merged to result to the /examples/{id} with both Get and Post methods coming from input 1 and input 2
```

### Add a new path resource

A new path can be added to the paths collection by specifying a different path

Example:

```yaml
# input 1:
paths:
  /examples/{id}: ...
  /samples/{id}: ...

# input 2:
paths:
  /actions/{id}: ...

# Will be merged to result to a definition containing the 3 different paths
```
