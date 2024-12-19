Thanks to the `@ama-sdk/core` plugins, you can intercept the API requests and responses to transform their data or
perform actions such as authentication, logging, etc.

These plugins will be applied before sending all the API requests and after the reception of the responses.

### Objective
In this tutorial, you will configure the `PetApi` to create a plugin whose purpose is to intercept the request before it is sent and serve a mocked response instead.

### Prerequisite
- The package `@ama-sdk/core` needs to be installed (which has already been done for you).

### Exercise
Create your own plugin that implements the `RequestPlugin` interface to mock the request plugin.
The exercise already contains the beginning of the code to inspire you. Here are some hints to help you as well:
- First, create a mock response of type `Pet[]` from the SDK.
- This object should be stringified and used to create a <a href="https://developer.mozilla.org/en-US/docs/Web/API/Blob" target="_blank">Blob</a>.
- Use the created `Blob` object to replace the base path (**hint**: check out the method <a href="https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static" target="_blank">URL.createObjectURL()</a>).

If implemented correctly, you should now see your mock response in the table of available pets, instead of the response from the Swagger Petstore.

> [!NOTE]
> Don't forget to check the exercise solution!

> [!TIP]
> The Otter framework provides several mock intercept plugins, including a mock intercept request plugin, which you can look further into if wanted to compare to this exercise.
> For more information, you can find all the <a href="https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/core#available-plugins" target="_blank">project plugins</a>
> in the @ama-sdk/core package of the Otter framework.
