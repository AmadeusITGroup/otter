## Api Configuration Override

The purpose of this plugin is to allow sending an encrypted JWT which overrides the configuration used by Digital Commerce.
The plugin takes an already encoded JWT (JWS) and adds it in an instance of `ama-client-facts` header.

### Type of plugins

- Request plugin: [ApiConfigurationOverride](./api-configuration-override.request.ts);
