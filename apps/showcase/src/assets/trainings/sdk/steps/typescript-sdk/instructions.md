### Objective
For this example, you will use the public <a href="https://petstore3.swagger.io/" target="_blank">Swagger Petstore project API</a>.
You will perform a simple call and retrieve a list of pets from an SDK programmatically generated from their public specification.
Since this step requires a Java setup, the generation has already been done for you. You will just need to integrate the Otter SDK client and perform your call.

### Exercise

#### Creation of fetch client in the application configuration
Let's create a fetch client in your application and use it to access your API.\
Here are a couple of steps and hints to help you:
- In the file `app.config.ts`, you will create an API client object of type `ApiFetchClient` from `@ama-sdk/client-fetch` in the existing function `petApiFactory()`.
- The constructor of `ApiFetchClient` requires some options, including the `basePath` which should be the Swagger Petstore API: https://petstore3.swagger.io/api/v3
- The configuration variable can then be used to create an API object of type `PetApi` from the SDK.
- The function `petApiFactory()` should return this `PetApi` object, which has been added to the providers of the application configuration.

#### Using the API object to perform an HTTP request
Now, you can call the API object to perform the HTTP request you are looking for.\
As you can see in `app.component.ts`, the `PetApi` has been injected and is ready to be used.\
For this exercise, you will look for the pets that are of status **available** and display in the UI the names of the first ten pets.

> [!TIP]
> Have a look at the `sdk/src/api/pet/pet.api.ts` file and look for `findPetsByStatus`.

> [!NOTE]
> You can check out the exercise solution or compare your answer to the result of the petstore API: https://petstore3.swagger.io/api/v3/pet/findByStatus?status=available
