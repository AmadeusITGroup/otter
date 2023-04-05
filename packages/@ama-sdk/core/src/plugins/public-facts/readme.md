> **Warning**: This pluging is deprecated and will be removed on v10, please use [ClientFactsPlugin](../client-facts/) plugin instead.

## Public facts

Plugin to manage Public facts sent to the API.
Facts are represented as an object of strings or numbers.

The plugin allows to define two layers of facts:

- Global: synchronous map of facts sent with every request
- Request: function that is called with all the request information where you can return specific facts for every request

If both are defined for a request, the priority is given to the request of specific facts.

Facts are stringified and encoded in base64 and are added to every request as a Header that is configurable.

### Type of plugins

- Request plugin: [PublicFactsRequestPlugin](./public-facts.request.ts)
