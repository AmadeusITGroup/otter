# Split Swagger Specification

A split Swagger specification is used internally to split a Swagger specification into several `yaml` files.
The specification is consolidated thanks to a `json` file.

## Consolidation JSON File

The **Consolidation JSON file** is a file describing the different items required to build the Swagger specification to a single `yaml` file.
The **Consolidation JSON file** has to follow the structure defined in a provided [Json Schema](../../packages/@ama-sdk/swagger-builder/src/schemas/api-configuration.schema.json) and must provide the following fields:

| Field               | Type                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :------------------ | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **swaggerTemplate** | String \| String[] \| Object | Path (or list of paths) to a `yaml` file that contains the envelope of your API (`info`, `schemes`...).<br/>The path(s) must be **relative** to the configuration file.<br/>Everything that is not `tags`, `parameters`, `paths`, `definitions` or `securityDefinition` can be defined in this file.<br/>In case of list of files, the files will be merged according to the array order.<br/><br/>Instead of a path(s), an object containing the template can be provided |
| **products**        | String[]                     | List of API products to include in the specification, corresponding to a `yaml` file in the `./products` folder (relative to the `json` file position).<br/> *example: the product `Core Ex` will include the file `./products/Core Ex.yaml`*                                                                                                                                                                                                                              |
| **additionalSpecs** | String[] *(optional)*        | List of Swagger specification to add to the product dependencies                                                                                                                                                                                                                                                                                                                                                                                                           |

As specified in the [referencing documentation](./referencing.md), the **Consolidation JSON file** is the one used by third party to reference the specification,
