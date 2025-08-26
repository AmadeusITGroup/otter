# Figma Extractor

The Figma Extractor tool allows the extraction of [Design Tokens](https://www.designtokens.org/tr/drafts/format/) from a single Figma file or a Figma project.\
The extractor will help you to:

- Manage the version of your Figma File
- Generate Design Token specification from a given Figma File (or Figma Project).
- Generate an NPM artifact containing your Design Token (and then benefit from sharing the design token file between npm projects and from tooling such as Renovate to automate the upgrade and CSS regeneration)

> [!NOTE]
> More details regarding the command is available on [@ama-styling/figma-extractor readme](https://www.npmjs.com/package/@ama-styling/figma-extractor).

> [!IMPORTANT]
> As Figma is currently missing features such as versioning and proper release management, a few assumptions and guidelines need to be taken by the extractor to avoid storing information outside from Figma.

## Extractor usage

The list of the commands and options supported by the Figma Extract is available on [@ama-styling/figma-extractor readme](https://www.npmjs.com/package/@ama-styling/figma-extractor).\
This section focuses on the data to provide the CLI and in which context it can be used.

### Access Permissions

To access the Figma File(s), a [Figma Access Token](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens) needs to be provided to the CLI via the `--accessToken` option or via the environment variable `FIGMA_TOKEN`.

The provided token should be configured with the following **read** permissions:

- **File content**: to access to the file components (including Effects, gradients, shadows, etc...).
- **Library assets**: to access to external referred components.
- **Library content**: to access to library published components.
- **File versions**: to determine the latest version set to the tokens, see [versioning](#versioning).
- **Variables**: to retrieve the list of variables to convert to Design Token.
- ***Projects*** (`extract-project` command only): retrieve the list of files withing a project to determine the latest one base on version, see [versioning](#versioning).

### Usage as NPM Package

The option `--generatePackage` of the CLI generates a [NPM Package](https://docs.npmjs.com/about-packages-and-modules) instead of a Design Token file. The package name can be configured thanks to the `--name` option. Its version is determined by the Figma file information (see [versioning](#versioning)).

For example, the following command:

```shell
npx @ama-styling/figma-extractor extract my-file-id --generatePackage --name @my-project/design-tokens
```

will generate, beside of the Design Token, a `package.json` file containing:

```json5
{
  "name": "@my-project/design-tokens",
  "version": "0.0.0-placeholder", // default if not specified in Figma
  "preferUnplugged": true,
  "exports": {
    ".": "./manifest.json",
    "./package.json": "./package.json",
    "./*.json": "./*.json"
  }
}
```

> [!NOTE]
> Extracting the Design token from the Figma file into an NPM has many advantages. You can now use it as an NPM dependency from your package which now allows you to :
>
> - Benefit from version update through bot such as [Renovate](https://docs.renovatebot.com/).
> - Use it as the source for your [Style Dictionary](https://styledictionary.com/) to generate your css.

You can then use the generated NPM Artifact as dependency of your application/library to generate your CSS following the next example:

```json5
// App/Lib package.json

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
  source: join(dirname(require.resolve('@my-project/design-tokens')), '*.tokens.json'),

  platforms: {
    // your configuration
  }
};

```

> [!TIP]
> See [@ama-styling/style-dictionary](https://www.npmjs.com/package/@ama-styling/style-dictionary) to setup a `config.mjs` file

### Versioning

Figma does not provide an explicit versioning mechanism for a Figma File.\
You can convey meaning to your Design Token updates (such as the introduction of a breaking feature, a non-breaking feature, a fix) by following the [Semantic Versioning](https://semver.org/) standard.

This way, the increase of a major will inform developers that the design of potential removal of tokens and migration efforts to apply the new design.\
Let's see how to do it.

#### Label in File History

The [History mechanism](https://help.figma.com/hc/en-us/articles/360038006754-View-a-file-s-version-history) of Figma allows the user to identify a specific revision thanks to a **Label**.
If you want the Figma Extractor to properly tag your Design Tokens and establish a consistent versioning history, ensure that the History labels follow the SemVer standard.

#### File Versioning

When dealing with several major versions, it may be convenient to split the Figma File into multiple version to simplify communication and update.

If your project follows such kind of architecture, running the extractor with the `extract-project` option will scan the whole Figma Project instead of a single Figma File.\
Thanks to the option `--filenamePattern` you can help the Figma Extractor to look for file versions and determine which version to use for your Figma Project.

> [!TIP]
> A limit of the considered version can be specified via the option `--versionRange`.
