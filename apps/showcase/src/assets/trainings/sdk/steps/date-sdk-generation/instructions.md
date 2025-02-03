As previously explained, dates can be generated differently based on the specifications and the generator options.

For this exercise, let's consider a specific use case. Imagine your SDK is used on a flight booking site, including international travel.
A user who is currently in France is planning a round trip from Paris to New York City. These cities are in different timezones, which needs
to be taken into account when the user books their flights. The outbound and return flights must be relative to the timezones of the airports.

To do so, the dates of the flights must be of type `utils.DateTime`.

Also, for this flight booking site, each flight has an expiration date-time for the payment, which is relative to the user's timezone.

### Exercise

> [!NOTE]
> This exercise should be done in your local environment (such as the SDK repository you created in the previous step). 
> We have provided the template and the solution on the right.
> (Due to a Java constraint, you won't be able to generate your own SDK in the code editor provided on the right.)

Let's create a specification file for our flight booking site. This SDK should contain a definition with the properties to book a flight:

- Origin location code
- Destination location code
- Departure date-time
- Payment expiration date

As mentioned above, the type of the departure date-time should be `utils.DateTime` after generation, which can be defined by setting the
type of the property to `string` and adding the `x-local-timezone` vendor (more information on how to do this in the
<a href="https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/schematics/schematics/typescript/shell/templates/base#manage-dates" target="_blank">documentation</a>).
Once your specification file is created, you can generate your SDK using the command below or the corresponding script in your `package.json` file.

```bash
yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./path/to/openapi.yaml
```

As you may notice, the generated date object is of type `string` instead of `Date`. This is normal since the default configuration
of the SDK generator has an option `stringifyDate` that is set to `true`. To ensure that the date object is generated correctly,
this option needs to be set to false either through the command line or in `openapitools.json`.

For example:
```bash
yarn schematics @ama-sdk/schematics:typescript-core --spec-path ./path/to/openapi.yaml --global-property stringifyDate=false
```
or
```json
"generators": {
  "training-project-training-sdk": {
    "generatorName": "typescriptFetch",
    "output": ".",
    "inputSpec": "./open-api.yaml",
    "globalProperty": {
      "stringifyDate": false
    }
  }
}
```

> [!NOTE]
> The `stringifyDate` option does not impact the generation of a `utils.Date` object.

To make sure you have generated the correct SDK locally, check out the file `src/models/base/flight/flight.ts` of the solution.
