There are several command lines available to generate an SDK depending on the use cases. These cases are covered in the
<a href="https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/schematics" target="_blank">@ama-sdk/schematics documentation</a>.

### Objective
Generate a new SDK repository using the previous specification file (Swagger Petstore) and the provided command line.

### Exercise
#### Generation of the SDK repository
To generate a new SDK repository, you can run the following command line (by replacing `<package-name>` with `training-sdk` for example):

```bash
npm create @ama-sdk typescript <package-name>
```

You will receive a prompt asking you to specify the project name. For example, you can set the project name to `training-project`.

```bash
? Project name (NPM package scope, package.json name will be @{projectName}/{packageName})? training-project
```

After setting the project name, you will see the shell of your SDK repository being generated with a structure that looks something like the following:
```
src
├── api
├── fixtures
├── helpers
├── models
│   ├── base
│   ├── core
│   └── custom
└── spec
```

You should also observe these scripts in the `package.json` file (with the correct project and package names):

```json
"generate": "schematics @ama-sdk/schematics:typescript-core",
"spec:regen": "npm run generate -- --generator-key training-project-training-sdk && amasdk-clear-index",
"spec:upgrade": "npm run spec:regen",
```

#### Generation of the API specifications

The repository does not contain the specification file since we did not pass it as a parameter to the command, so it must be created manually.
Create a new file with your API specifications (created in the previous step). The standard convention is to name this file `open-api.yaml`.

*If you have an existing specification file, you have the option to pass the parameter `--spec-path [path to your openapi file]` to the
create command used above, which will add your specification file to the repository.*


Next, specify the path of your specification file in the `inputSpec` property of the `openapitools.json` file at the root.

You can now run the command `yarn spec:upgrade` and notice that the **api** and **models/base** folders have been updated with the paths and definitions from your specification file.

> [!NOTE]
> Notice that the `yarn spec:upgrade` command is equivalent to running the command below, which means that we use the configuration of the
> `openapitools.json` file. These configuration properties can also be passed as parameters to the command line (to set or override the property).
> This tip will be useful for the next steps of the training.


```bash
yarn schematics @ama-sdk/schematics:typescript-core --generator-key training-project-training-sdk
```

You can find more information in the
<a href="https://github.com/AmadeusITGroup/otter/tree/main/packages/%40ama-sdk/schematics#generator-configuration" target="_blank">generator configuration documentation</a>.

#### Solution
Once generated, you can compare your generated SDK to the <a href="https://github.com/AmadeusITGroup/otter/tree/main/packages/%40o3r-training/showcase-sdk" target="_blank">Otter Showcase SDK</a>.

