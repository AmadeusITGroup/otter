### Objective
Let's continue with the use case of the previous exercise.\
In order to keep track of the user's current booking, it would be useful to generate an ID.\
To do this, we are going to create a new model which extends the previously generated `Flight` type.

### Exercise

#### Check out the base model
Before proceeding with the extension of the model, let's take a moment to review what is in the base model.
In the folder `libs/sdk/src/models/base/flight`, there are 3 files:
- `flight.ts` is the base model definition
- `flight.reviver.ts` is the reviver of the base model
- `index.ts` is the exposed entry point

By default, the revivers are only generated when needed:
- If `Date` fields are present and not stringified
- If `dictionaries` are present
- If `modelExtension` is enabled

If you open the file `libs/sdk/openapitools.json`, you can see that we have set the value of `allowModelExtension` to `true`.
This way, we make sure that the revivers will always be generated.

Now that we've seen the base model, let's start with the extension.

#### Creating the extended model
The extended model will follow a similar structure to the base model.
In the folder `libs/sdk/src/models/core/flight`, you will see the same 3 files mentioned before.

First, let's create the type `FlightCoreIfy` in `libs/sdk/src/models/core/flight.ts`.
This type should extend the type `Flight`, imported from the `base` folder and add a new field `id` of type `string`.

> [!WARNING]
> The naming convention requires the core model to contain the suffix `CoreIfy`.\
> You can find more information on core models in the
> <a href="https://github.com/AmadeusITGroup/otter/blob/main/docs/api-sdk/SDK_MODELS_HIERARCHY.md" target="_blank">SDK models hierarchy documentation</a>.

#### Creating the extended reviver
Now that you have your extended model, let's create the associated reviver in `libs/sdk/src/models/core/flight.reviver.ts`.\
This extended reviver will call the reviver of the base `Flight` model and add the `id` to the returned object.

#### Updating the exports
Once the core model and its reviver are created, we can go back to the base model to update the exported models and revivers.\
Update the file `libs/sdk/src/models/base/flight/index.ts` to export your extended model and reviver instead of the original.

#### Seeing the result
Your extension should now be working!\
Check out the preview to see if the `id` has been added to the model.

#### Persistence of the change
You may have realized that we have modified a portion of code that was originally generated.
We don't want to lose the change that we made on `libs/sdk/src/models/base/flight/index.ts` next time it's regenerated.
To avoid that, we can add `src/models/base/flight/index.ts` to the `libs/sdk/.openapi-generator-ignore` file.
We cannot regenerate the SDK in the code editor due to a Java dependency but feel free to try it in a local project.

> [!TIP]
> Don't forget to check out the solution of this exercise!

