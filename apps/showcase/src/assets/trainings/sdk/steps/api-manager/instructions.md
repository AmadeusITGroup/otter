When dealing with an Angular project, you need to ensure that your `ApiClient` will be shared across your application.
The Otter framework provides the `ApiManager` service to manage your API collection.

### Objective
- Leverage the `ApiManager` service to access two different clients to retrieve the list of available pets and get the Swagger Petstore inventory.
- Add a plugin to the `StoreApi` to alert each time a call is sent.

### Prerequisite
- The package `@o3r/apis-manager` needs to be installed (which has already been done for you).

### Exercise

#### Existing plugins
As you can see in the `app.config.ts` file, a plugin `RequestAlertPlugin` has been created which displays an alert box when the API receives a request.
There is also a `MockInterceptRequest` plugin, similar to the one created in the step **Customize your fetch client with plugins**, to mock the request plugin.

#### Integrate the ApiManagerModule with default configuration
First, create the variable `apiConfig` with the properties of `ApiFetchClient`. This default configuration should contain the `MockInterceptRequest` 
plugin (similar to the exercise in the previous step). Here is a template to get you started:
```typescript
// Default configuration for all the APIs defined in the ApiManager
const apiConfig: ApiClient = new ApiFetchClient(
  {
    // Properties of ApiFetchClient
  }
);
```

Next, create the `apiManager` variable like this:
```typescript
const apiManager = new ApiManager(apiConfig);
```

You can now integrate the `ApiManagerModule` in the providers of your `ApplicationConfig`. You can use the following line to guide you:
```typescript
importProvidersFrom(ApiManagerModule.forRoot(apiManager))
```

> [!NOTE]
> This integration should replace the previous providers of `PetApi` and `StoreApi` using the factories `petApiFactory` and `storeApiFactory` 
> in the `ApplicationConfig`.

Then, checkout the `app.component.ts` file and update the variables `petApi` and `storeApi` by injecting the `ApiFactoryService` to use your 
unique instance of the `StoreApi` and `PetApi`.

Now, when clicking the **Get Available Pets** button, your table should be updated with the mock value of available pets and when clicking the 
**Get Inventory** button, you should see the mock value of inventory.

#### Override of the default configuration
Let's override the default configuration by updating `apiManager` and configuring it to use the `RequestAlertPlugin` in the `StoreApi`.
You can inspire yourself with the following lines:

```typescript
const apiManager = new ApiManager(apiConfig, {
  // Configuration override for a specific API
  StoreApi: new ApiFetchClient({
    // Properties of ApiFetchClient
  })
});
```

Let's see how this new configuration override impacts the default configuration.
When clicking the **Get Available Pets** button, your table should still display the mock value of available pets (without the alert box).
When clicking the **Get Inventory** button, you should see the request to the `StoreApi` logged in the alert box and the actual result displayed
in the UI (not the mock value like before).

We can conclude that the configuration override does not merge the plugins, but replaces them.
