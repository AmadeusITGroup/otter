# Generate CSS

> [!WARNING]
> This documentation is covering a deprecated builder, please use `generate-style` instead.

The `generate-css` builder can generate CSS and CMS Metadata based on given Design Token Json files.

| Options                     | Default Value  | Description                                                                                                                          |
| --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **designTokenFilePatterns** | [] *Require*   | Path patterns to the Design Token JSON files. <br /> Files in dependencies are supported and resolved with Node Resolver.            |
| **variableType**            | `'css'`        | Type of the variables to generate for a Design Token.                                                                                |
| **output**                  | *null*         | Output file where the CSS will be generated. <br /> The path specified in `o3rTargetFile` will be ignore if this option is specified |
| **defaultStyleFile**        | src/theme.scss | File path to generate the variable if not determined by the specifications                                                           |
| **metadataOutput**          | *null*         | Path to generate the metadata for the CMS. <br /> The metadata will be generated only if the file path is specified.                 |
| **metadataIgnorePrivate**   | false          | Ignore the private variable in the metadata generation.                                                                              |
| **rootPath**                | *null*         | Root path of files where the CSS will be generated.                                                                                  |
| **failOnDuplicate**         | false          | Determine if the process should stop in case of Token duplication.                                                                   |
| **templateFile**            | *null*         | Path to a template file (or a list of template files) to apply as default configuration to a Design Token extension.                 |
| **prefix**                  | *null*         | Prefix to append to generated variables.                                                                                             |
| **prefixPrivate**           | *null*         | Prefix to append to generated private variables.                                                                                     |
| **watch**                   | false          | Enable Watch mode.                                                                                                                   |
