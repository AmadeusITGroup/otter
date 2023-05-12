## Session ID

Plugin to add a header with an ID that can be used to track all the calls made by one or several APIs of the SDK.

This ID is composed of both a session part and a request part resulting in a unique ID for a single request.
It is formatted as `SESSION_ID:REQUEST_ID` where:

- **SESSION_ID** is an UUID identifying the client-side user session
- **REQUEST_ID** is a unique token within a session matching the [a-zA-Z0-9]{1,10} format

The **REQUEST_ID** can be deactivated. In this case the ID is formatted as **SESSION_ID** only.

### Type of plugins

- Request plugin: [SessionIdRequest](./session-id.request.ts)
