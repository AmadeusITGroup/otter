<h1 align="center">Otter Framework</h1>
<p align="center">
  <img src="./.attachments/logo.png" alt="Super cute Otter!"/>
</p>

<br />
<br />

## Description

The **Otter** Project has the goal to provide a common platform to accelerate and facilitate the development on web application based on Angular.
Otter is a very modular framework split in several unit working together on a common base allowing CMS customization.

> **Note**:  The full documentation is available [here](./docs/README.md).

## Built With

* [Angular](https://angular.io/)
* [Typescript](https://www.typescriptlang.org/)
* [RxJs](http://reactivex.io/rxjs/)
* [Redux](http://redux.js.org/)
* [Sass](http://sass-lang.com/)
* [Nx](https://nx.dev/)

## Get Started

A new application can be with the simple commands:

```shell
# Starting a new angular application
npm install -g @angular/cli
ng new my-app

# Add Otter framework
ng add @o3r/core
```

> **Note**: Please refer to [Otter Get Started](./docs/core/START_NEW_APPLICATION.md) and [Angular Get Started](https://angular.io/guide/setup-local#install-the-angular-cli) documentations for complete documentation

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

Please refer to [Security file](./SECURITY.md).

## License

Please refer to the [License file](./LICENSE).

## Acknowledgments

The [Otter Team](https://github.com/orgs/amadeus-digital/teams/otter) is responsible for the review of the code of this repository.
Any bug of feature request can be addressed via [issue](https://github.com/AmadeusITGroup/otter/issues/new/choose) report.

## Developer

### Building and Testing library

This document describes how to set up your development environment to build and test library.
It also explains the basic mechanics of using `git`, `node`, and `npm`.

- [Description](#description)
- [Built With](#built-with)
- [Get Started](#get-started)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Developer](#developer)
  - [Building and Testing library](#building-and-testing-library)
    - [Prerequisite Software](#prerequisite-software)
    - [Getting the Sources](#getting-the-sources)
    - [Installing NPM Modules](#installing-npm-modules)
    - [Build command](#build-command)
    - [Running tests locally](#running-tests-locally)
    - [Manage task cache](#manage-task-cache)
    - [Debugging with Visual Studio Code](#debugging-with-visual-studio-code)
    - [Link local packages](#link-local-packages)

See the [contribution guidelines](./CONTRIBUTING.md)
if you'd like to contribute to framework.

#### Prerequisite Software

Before you can build and test Otter modules, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=10.0.0`) which is used to run tests, and generate distributable files. We also use Node's Package Manager, `npm`
  (version `>3.8.x`), which comes with Node. Depending on your system, you can install Node either from
  source or as a pre-packaged bundle.
  
* [Yarn](https://yarnpkg.com/lang/en/docs/install/), a Node's Package Manager. You can install yarn using NPM manager (coming with Node.js).
  The version of Yarn currently used is embedded in the repository. In case you need to link this library with your project, you can check the section "Link local packages"

* [Chrome](https://www.google.com/chrome/browser/desktop/index.html), we use Chrome to run our tests.

#### Getting the Sources

Clone the Otter repository:

1. Login to [Github enterprise](https://github.com/AmadeusITGroup/otter) using your P-Account.
2. Clone the project using the button `Code` or using the following git command

```shell
git clone https://github.com/AmadeusITGroup/otter.git
```

#### Installing NPM Modules

Next, install the JavaScript modules needed to build:

```shell
# Install library project dependencies (package.json)
yarn install
```

#### Build command

To build the modules, run:

```shell
yarn run build
```

Each module can be built independently thanks to [Nx](https://nx.dev/packages/nx/documents/run) commands:

```shell
# ex: Build Core package only
yarn nx build core
```

> Notes: Results are put in the `dist` of each modules (`packages/@<scope>/<module>/dist`).

#### Running tests locally

Check the formatting :

```shell
yarn run lint
```

Check Unit Test :

```shell
yarn run test
```

Each module can be test independently thanks to [Nx](https://nx.dev/packages/nx/documents/run) commands:

```shell
# ex: Test Core package only
yarn nx test core

# ex: Lint Core package only
yarn nx lint core
```

#### Manage task cache

When running the Build, Lint or Test commands, **Nx** can use its [cache mechanism](https://nx.dev/concepts/how-caching-works).
For some reason, it can be useful to clean the cache to investigate issue, this can be done via the following command:

```shell
yarn nx reset
```

#### Debugging with Visual Studio Code

The repository embedded the mandatory configuration and recommended VSCode plugging to be the most comfortable possible to develop on the Otter Framework.

The default configuration of the repository provide a way to run Unit Test one per one and to define, within VSCode, break points using the `vscode-jest-tests` debugger task.

The Otter Demo Application, included in the folder `apps/@o3r/demo` can be run by the following command:

```shell
yarn start
```

#### Link local packages

With Yarn v1, in the main package.json, add a `resolutions` property with the relative path to the `dist` of the local package, the protocol `link:` can be used.
NOTE: It will not bring dependencies of the linked package.

Example:

```json
{
  "resolutions": {
    "@o3r/localization": "./relative/path/to/otter/packages/@o3r/localization/dist",
    "@o3r/core": "link:./relative/path/to/otter/packages/@o3r/core/dist",
  }
}
```

With Yarn v2+, the protocol `portal:` can also be used
NOTE: With the portal protocol it will bring all the dependencies of the linked package.
Some issues can happen because of the mismatch version of these dependencies.

Example:

```json
{
  "resolutions": {
    "@o3r/localization": "./relative/path/to/otter/library/@o3r/localization/dist",
    "@o3r/core": "link:./relative/path/to/otter/library/@o3r/core/dist",
    "@o3r/rules-engine": "portal:./relative/path/to/otter/library/@o3r/rules-engine/dist",
  }
}
```
