## Client Facts

Plugin to manage client facts send to the API.
 Public facts are represented as an object of strings or numbers.
 Private facts are represented as strings.

 The plugin allows to define two layers of facts:

- Global: synchronous map of facts sent with every request
- Request: function that is called with all the request information where you can return specific facts for every request
 If both are defined for a request, the priority is given to request specific facts.

 Facts are added to every request as a Header that is configurable.
 Public facts are stringified and encoded in base64 before being sent.

### Type of plugins

- Request plugin: [ClientFactsRequestPlugin](./client-facts.request.ts);
