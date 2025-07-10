# Figma Extractor

The Figma Extractor tool allows the extraction of [Design Tokens](https://www.designtokens.org/tr/drafts/format/) from a single Figma file or a Figma project.

> [!NOTE]
> More details regarding the command is available on [@ama-styling/figma-extractor readme](https://www.npmjs.com/package/@ama-styling/figma-extractor).

## Guidelines

To complete Figma currently missing feature, few assumptions and guidelines has been taken by the extractor to let data to be driven by Figma.

### Versioning solution

Figma does not provide explicit versioning mechanism for a Figma File.\
To make sure to have the proper information regarding the update a Design Token, it is important to apply manually a versioning following the [Semantioc Versioning](https://semver.org/) standard.

#### Label in File History

Figma offers a [History mechanism](https://help.figma.com/hc/en-us/articles/360038006754-View-a-file-s-version-history) allowing to defined a **Label** to a specific revision.
In manner to get a propper version list determined by the Figma Extractor, the history labels corresponding to a SemVer version can be applied.

#### File Versioning

To simplified the segmentation of **Major release version**, it can be interesting to have mulliple Figma File for each major versions.

To allow it the Figma Extractor expose the `extract-project` which will consider a whole Figma Project instead of a single Figma File.\
Thanks to the option `--filenamePattern` it is possible to help the Figma Extractor to discover the file version to determine the latest one of the Figma Project.

> [!TIP]
> A limit of the considered version can be specified via the option `--versionRange`.

## Extractor usage

The list of the commands and options supported by the Figma Extract is available on [@ama-styling/figma-extractor readme](https://www.npmjs.com/package/@ama-styling/).\
This session of the documentation will focus on the information to provide to the CLI and the context where it can be used.

### Access Permissions

To properly access to the Figma File(s), a [Figma Access Token](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens) need to be provided to the CLI via the `--accessToken` (or the environment variable `FIGMA_TOKEN`).

The provided token should have the following **read** permissions:

- **File content**: to access to the file components (including Effects, gradients, shadows, etc...)
- **Library assets**: to access to external referred components
- **Library content**: to access to library published components
- **File versions**: to determine the latest version set to the tokens, see [versioning](#versioning-solution).
- **Variables**: to retrieve the list of variables to convert to Design Token.
- ***Projects*** (`extract-project` command only): retrieve the list of files withing a project to determine the latest one base on version, see [versioning](#versioning-solution).

### Usage as NPM Package

The option `--generatePackage` of the CLI allow to generate a [NPM Package](https://docs.npmjs.com/about-packages-and-modules) with a name that can be set via the `--name` option and a version determined by the Figma file information (see [versioning](#versioning-solution)).

This feature can help to consider the Design Token as a package (published or not) part of a mono-repository and be used in a [Style Dictionary](https://styledictionary.com/) source.

Example of Style Dictionary configuration:

```json5
// package.json

{
  "name": "my-app",
  "devDependencies": {
    "@my-project/design-tokens": "*",
    "style-dictionary": "*"
  }
}
```

```javascript
// config.mjs

import { dirname, join } from 'node:path';

/** @type {import('style-dictionary').Config} */
export default {
  usesDtcg: true, // Use Design Token Standard format

  // List the files from your Design Tokens NPM package
  source: join(dirname(require.resolve('@my-project/design-tokens')), '*.json'),

  platforms: {
    // your configuration
  }
};

```

> [!TIP]
> See [@ama-styling/style-dictionary](https://www.npmjs.com/package/@ama-styling/style-dictionar) to setup a `config.mjs` file
